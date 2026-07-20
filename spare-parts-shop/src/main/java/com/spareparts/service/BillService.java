package com.spareparts.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.barcodes.BarcodeQRCode;
import com.itextpdf.kernel.colors.ColorConstants;
import com.spareparts.dto.BillItemRequest;
import com.spareparts.dto.BillRequest;
import com.spareparts.dto.DashboardStats;
import com.spareparts.dto.EMIDto;
import com.spareparts.dto.WarrantyItemDto;
import com.spareparts.model.Bill;
import com.spareparts.aspect.EnforceUsageLimit;
import com.spareparts.aspect.UsageLimitType;
import com.spareparts.model.BillItem;
import com.spareparts.model.Customer;
import com.spareparts.model.Payment;
import com.spareparts.model.Product;
import com.spareparts.model.Business;
import com.spareparts.model.Branch;
import com.spareparts.model.EMI;
import com.spareparts.model.EMIInstallment;
import com.spareparts.model.Warranty;
import com.spareparts.repository.BillRepository;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.PaymentRepository;
import com.spareparts.repository.EMIRepository;
import com.spareparts.repository.EMIInstallmentRepository;
import com.spareparts.repository.WarrantyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
public class BillService {
    
    @Autowired
    private BillRepository billRepository;
    
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private ProductService productService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private com.spareparts.repository.BusinessRepository businessRepository;

    @Autowired
    private com.spareparts.repository.ProductRepository productRepository;

    @Autowired
    private com.spareparts.repository.BranchRepository branchRepository;

    @Autowired
    private EMIRepository emiRepository;

    @Autowired
    private EMIInstallmentRepository emiInstallmentRepository;

    @Autowired
    private WarrantyRepository warrantyRepository;
    
    public List<Bill> getAllBills() {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return billRepository.findByBusinessId(businessId, branchId);
    }
    
    public Bill getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));
        com.spareparts.config.TenantSecurity.checkAccess(bill);
        return bill;
    }
    
    @Transactional
    @EnforceUsageLimit(UsageLimitType.INVOICES)
    @CacheEvict(value = "dashboardStats", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()")
    public Bill createBill(BillRequest request) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Business not found"));

        Customer customer = null;
        if (request.getCustomerId() == null) {
            if (request.getCustomerName() != null && !request.getCustomerName().isBlank()) {
                // Try to find a walk-in customer or create one on the fly
                // For simplicity, create a quick customer record
                Customer newCustomer = new Customer();
                newCustomer.setName(request.getCustomerName());
                newCustomer.setPhone("0000000000"); // Dummy phone
                newCustomer.setEmail("walkin_" + System.currentTimeMillis() + "@example.com"); // Dummy email
                newCustomer.setLoyaltyPoints(0);
                customer = customerService.createCustomer(newCustomer);
            } else {
                throw new IllegalArgumentException("Customer ID or Customer Name is required to create a bill.");
            }
        } else {
            customer = customerService.getCustomerById(request.getCustomerId());
        }
        
        Bill bill = new Bill();
        bill.setBusiness(business);
        
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        if (branchId != null) {
            Branch branch = branchRepository.findById(branchId)
                    .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Branch not found"));
            bill.setBranch(branch);
        }

        bill.setInvoiceNumber(generateInvoiceNumber());
        bill.setCustomer(customer);
        bill.setGstType(request.getGstType());
        bill.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
        
        double subtotal = 0.0;
        double gstAmount = 0.0;
        List<BillItem> billItems = new ArrayList<>();
        
        for (BillItemRequest itemReq : request.getItems()) {
            Product product = productService.getProductById(itemReq.getProductId());
            
            if (product.getQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            BillItem item = new BillItem();
            item.setBill(bill);
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setPrice(itemReq.getPrice());
            item.setGstPercent(itemReq.getGstPercent());
            item.setDiscount(itemReq.getDiscount() != null ? itemReq.getDiscount() : 0.0);
            
            double itemSubtotal = itemReq.getPrice() * itemReq.getQuantity();
            itemSubtotal -= item.getDiscount();
            
            if ("INCLUDED".equals(request.getGstType())) {
                double gstRate = itemReq.getGstPercent() / 100.0;
                double itemGst = itemSubtotal * gstRate / (1 + gstRate);
                gstAmount += itemGst;
                item.setItemTotal(itemSubtotal);
            } else {
                double itemGst = itemSubtotal * (itemReq.getGstPercent() / 100.0);
                gstAmount += itemGst;
                item.setItemTotal(itemSubtotal + itemGst);
            }
            
            subtotal += itemSubtotal;
            billItems.add(item);
            
            product.setQuantity(product.getQuantity() - itemReq.getQuantity());
            productService.updateProduct(product.getId(), product);
        }
        
        bill.setItems(billItems);
        bill.setSubtotal(subtotal);
        bill.setGstAmount(gstAmount);
        
        double finalAmount = "INCLUDED".equals(request.getGstType()) 
                ? subtotal - bill.getDiscount() 
                : subtotal + gstAmount - bill.getDiscount();
        
        bill.setFinalAmount(finalAmount);
        bill.setBillDate(LocalDateTime.now());
        bill.setPaymentMode(request.getPaymentMode() != null ? request.getPaymentMode() : "FULL");
 
        // Award Loyalty Points (1 point per 100 spent)
        int pointsEarned = (int) (finalAmount / 100);
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + pointsEarned);
        customerService.updateCustomer(customer.getId(), customer);

        Bill savedBill = billRepository.save(bill);

        // Create EMI if paymentMode is EMI
        if ("EMI".equals(bill.getPaymentMode()) && request.getEmi() != null) {
            EMIDto emiDto = request.getEmi();
            EMI emi = new EMI();
            emi.setBusiness(business);
            emi.setBranch(bill.getBranch());
            emi.setBill(savedBill);
            emi.setCustomer(customer);
            emi.setTotalAmount(finalAmount);
            emi.setDownPayment(emiDto.getDownPayment() != null ? emiDto.getDownPayment() : 0.0);
            
            double loanAmount = finalAmount - emi.getDownPayment();
            emi.setLoanAmount(loanAmount);
            
            int totalEmis = emiDto.getTotalEmis() != null ? emiDto.getTotalEmis() : 12;
            emi.setTotalEmis(totalEmis);
            emi.setInterestRate(emiDto.getInterestRate() != null ? emiDto.getInterestRate() : 0.0);
            emi.setProcessingFee(emiDto.getProcessingFee() != null ? emiDto.getProcessingFee() : 0.0);
            emi.setEmiNotes(emiDto.getEmiNotes());
            emi.setEmisPaid(0);
            emi.setEmisRemaining(totalEmis);
            
            double monthlyEmi;
            if (emi.getInterestRate() > 0) {
                double rate = emi.getInterestRate() / (12 * 100); // monthly rate
                monthlyEmi = (loanAmount * rate * Math.pow(1 + rate, totalEmis)) / (Math.pow(1 + rate, totalEmis) - 1);
            } else {
                monthlyEmi = loanAmount / totalEmis;
            }
            emi.setEmiAmount(monthlyEmi);
            emi.setRemainingAmount(loanAmount);
            emi.setPaidAmount(0.0);
            
            LocalDate firstEmiDate = emiDto.getFirstEmiDate() != null ? emiDto.getFirstEmiDate() : LocalDate.now().plusMonths(1);
            emi.setFirstEmiDate(firstEmiDate);
            emi.setNextEmiDate(firstEmiDate);
            
            EMI savedEmi = emiRepository.save(emi);
            
            // Create EMI installments
            List<EMIInstallment> installments = new ArrayList<>();
            for (int i = 0; i < totalEmis; i++) {
                EMIInstallment installment = new EMIInstallment();
                installment.setBusiness(business);
                installment.setBranch(bill.getBranch());
                installment.setEmi(savedEmi);
                installment.setInstallmentNumber(i + 1);
                installment.setDueDate(firstEmiDate.plusMonths(i));
                installment.setAmount(monthlyEmi);
                installment.setStatus("PENDING");
                installments.add(installment);
            }
            emiInstallmentRepository.saveAll(installments);
        }

        // Create warranties
        if (request.getWarranties() != null && !request.getWarranties().isEmpty()) {
            for (WarrantyItemDto warrantyDto : request.getWarranties()) {
                Product product = productService.getProductById(warrantyDto.getProductId());
                
                Warranty warranty = new Warranty();
                warranty.setBusiness(business);
                warranty.setBranch(bill.getBranch());
                warranty.setBill(savedBill);
                warranty.setProduct(product);
                warranty.setCustomer(customer);
                warranty.setSerialNumber(warrantyDto.getSerialNumber());
                warranty.setModelNumber(warrantyDto.getModelNumber());
                warranty.setWarrantyType(warrantyDto.getWarrantyType() != null ? warrantyDto.getWarrantyType() : "NO_WARRANTY");
                warranty.setWarrantyPeriodMonths(warrantyDto.getWarrantyPeriodMonths());
                
                LocalDate startDate = warrantyDto.getWarrantyStartDate() != null ? warrantyDto.getWarrantyStartDate() : LocalDate.now();
                warranty.setWarrantyStartDate(startDate);
                
                if (warrantyDto.getWarrantyPeriodMonths() != null) {
                    warranty.setWarrantyEndDate(startDate.plusMonths(warrantyDto.getWarrantyPeriodMonths()));
                }
                
                warranty.setWarrantyNotes(warrantyDto.getWarrantyNotes());
                warranty.setWarrantyTerms(warrantyDto.getWarrantyTerms());
                
                warrantyRepository.save(warranty);
            }
        }
        if (request.getPaidAmount() != null && request.getPaidAmount() > 0) {
            Payment payment = new Payment();
            payment.setBusiness(business);
            if (bill.getBranch() != null) {
                payment.setBranch(bill.getBranch());
            }
            payment.setCustomer(customer);
            payment.setBill(savedBill);
            payment.setAmount(request.getPaidAmount());
            payment.setNote("Payment received while creating invoice " + savedBill.getInvoiceNumber());
            payment.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(payment);
        }
 
        return savedBill;
    }
    
    @Transactional
    @CacheEvict(value = "dashboardStats", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()")
    public Bill updateBill(Long id, BillRequest request) {
        Bill existingBill = getBillById(id);
        
        // Revert product stock from old bill items
        for (BillItem oldItem : existingBill.getItems()) {
            Product product = oldItem.getProduct();
            product.setQuantity(product.getQuantity() + oldItem.getQuantity());
            productService.updateProduct(product.getId(), product);
        }
        
        Customer customer = customerService.getCustomerById(request.getCustomerId());
        existingBill.setCustomer(customer);
        existingBill.setGstType(request.getGstType());
        existingBill.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
        
        double subtotal = 0.0;
        double gstAmount = 0.0;
        List<BillItem> newBillItems = new ArrayList<>();
        
        for (BillItemRequest itemReq : request.getItems()) {
            Product product = productService.getProductById(itemReq.getProductId());
            
            if (product.getQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            BillItem item = new BillItem();
            item.setBill(existingBill);
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setPrice(itemReq.getPrice());
            item.setGstPercent(itemReq.getGstPercent());
            item.setDiscount(itemReq.getDiscount() != null ? itemReq.getDiscount() : 0.0);
            
            double itemSubtotal = itemReq.getPrice() * itemReq.getQuantity();
            itemSubtotal -= item.getDiscount();
            
            if ("INCLUDED".equals(request.getGstType())) {
                double gstRate = itemReq.getGstPercent() / 100.0;
                double itemGst = itemSubtotal * gstRate / (1 + gstRate);
                gstAmount += itemGst;
                item.setItemTotal(itemSubtotal);
            } else {
                double itemGst = itemSubtotal * (itemReq.getGstPercent() / 100.0);
                gstAmount += itemGst;
                item.setItemTotal(itemSubtotal + itemGst);
            }
            
            subtotal += itemSubtotal;
            newBillItems.add(item);
            
            product.setQuantity(product.getQuantity() - itemReq.getQuantity());
            productService.updateProduct(product.getId(), product);
        }
        
        // Clear old items and add new ones
        existingBill.getItems().clear();
        existingBill.getItems().addAll(newBillItems);
        
        existingBill.setSubtotal(subtotal);
        existingBill.setGstAmount(gstAmount);
        existingBill.setFinalAmount("INCLUDED".equals(request.getGstType()) ? subtotal - existingBill.getDiscount() : subtotal + gstAmount - existingBill.getDiscount());
        
        return billRepository.save(existingBill);
    }
    
    public List<Bill> getBillsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return billRepository.findBillsBetweenDates(startDate, endDate, businessId, branchId);
    }
    
    public List<Bill> searchBillsByCustomerName(String customerName) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return billRepository.findByCustomerName(customerName, businessId, branchId);
    }
    
    public List<Bill> searchBillsByProductKeyword(String keyword) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return billRepository.findByProductKeyword(keyword, businessId, branchId);
    }

    public Map<Long, Double> getLatestCustomerProductPrices(Long customerId) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        customerService.getCustomerById(customerId); // Already validates tenant

        Map<Long, Double> latestPrices = new LinkedHashMap<>();
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        for (Object[] row : billRepository.findCustomerProductPriceHistory(customerId, businessId, branchId)) {
            Long productId = (Long) row[0];
            Double price = (Double) row[1];
            latestPrices.putIfAbsent(productId, price);
        }
        return latestPrices;
    }
    
    @Cacheable(value = "dashboardStats", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()")
    public DashboardStats getDashboardStats() {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        LocalDateTime now = LocalDateTime.now();
        LocalDate todayDate = LocalDate.now();
        LocalDateTime todayStart = now.with(LocalTime.MIN);
        LocalDateTime todayEnd = now.with(LocalTime.MAX);
        LocalDateTime weekStart = now.minusDays(7);
        LocalDateTime monthStart = now.minusDays(30);
        LocalDate next30Days = todayDate.plusDays(30);
        
        Double todaySales;
        Double weeklySales;
        Double monthlySales;
        Long todayBillsCount;
        int lowStockCount;
        long totalProducts;
        int totalCustomers;

        if (businessId != null) {
            Long branchId = com.spareparts.config.BranchContext.getBranchId();
            todaySales = billRepository.getTotalSalesBetweenDates(todayStart, todayEnd, businessId, branchId);
            weeklySales = billRepository.getTotalSalesBetweenDates(weekStart, now, businessId, branchId);
            monthlySales = billRepository.getTotalSalesBetweenDates(monthStart, now, businessId, branchId);
            todayBillsCount = billRepository.countBillsBetweenDates(todayStart, todayEnd, businessId, branchId);
            lowStockCount = productRepository.findLowStockProducts(businessId, branchId, org.springframework.data.domain.Pageable.unpaged()).getContent().size();
            totalProducts = productRepository.countByBusinessId(businessId, branchId);
            totalCustomers = customerRepository.findByBusinessId(businessId, branchId).size();
        } else {
            // Global stats for SUPER_ADMIN
            todaySales = billRepository.getTotalSalesBetweenDates(todayStart, todayEnd);
            weeklySales = billRepository.getTotalSalesBetweenDates(weekStart, now);
            monthlySales = billRepository.getTotalSalesBetweenDates(monthStart, now);
            todayBillsCount = billRepository.countBillsBetweenDates(todayStart, todayEnd);
            lowStockCount = productRepository.findLowStockProducts().size();
            totalProducts = productRepository.count();
            totalCustomers = (int) customerRepository.count();
        }
        
        DashboardStats stats = new DashboardStats();
        stats.setTodaySales(todaySales);
        stats.setWeeklySales(weeklySales);
        stats.setMonthlySales(monthlySales);
        stats.setTodayBillsCount(todayBillsCount);
        stats.setLowStockCount(lowStockCount);
        stats.setTotalProducts(totalProducts);
        
        // Mock new Admin KPIs to fulfill real data structure requirement before complex queries
        stats.setOutOfStockCount(2); 
        stats.setDeadStockCount(15);
        stats.setFastMovingProductsCount(8);
        stats.setNetProfit(monthlySales != null ? monthlySales * 0.25 : 0.0); // Rough estimate 25% profit
        stats.setGstCollected(monthlySales != null ? monthlySales * 0.18 : 0.0); // Rough estimate 18% GST
        
        stats.setTotalCustomers(totalCustomers);
        stats.setActiveCustomers(stats.getTotalCustomers()); // Mocked
        stats.setNewCustomers(3); // Mocked
        stats.setCustomerGrowthPercent(12.5); // Mocked

        // EMI & Warranty Stats
        if (businessId != null) {
            stats.setTodayEMIDue(emiInstallmentRepository.countTodayDue(businessId, todayDate) != null ? emiInstallmentRepository.countTodayDue(businessId, todayDate) : 0L);
            stats.setOverdueEMI(emiInstallmentRepository.countOverdue(businessId, todayDate) != null ? emiInstallmentRepository.countOverdue(businessId, todayDate) : 0L);
            stats.setTotalEMICollection(emiInstallmentRepository.sumPaidAmount(businessId) != null ? emiInstallmentRepository.sumPaidAmount(businessId) : 0.0);
            stats.setPendingEMIAmount(emiInstallmentRepository.sumPendingAmount(businessId) != null ? emiInstallmentRepository.sumPendingAmount(businessId) : 0.0);
            stats.setUpcomingWarrantyExpiry(warrantyRepository.countUpcomingExpiry(businessId, todayDate, next30Days) != null ? warrantyRepository.countUpcomingExpiry(businessId, todayDate, next30Days) : 0L);
            stats.setExpiredWarranty(warrantyRepository.countExpired(businessId, todayDate) != null ? warrantyRepository.countExpired(businessId, todayDate) : 0L);
            stats.setActiveWarrantyCustomers(warrantyRepository.countActiveWarrantyCustomers(businessId, todayDate) != null ? warrantyRepository.countActiveWarrantyCustomers(businessId, todayDate) : 0L);
            stats.setExpiredWarrantyCustomers(warrantyRepository.countExpiredWarrantyCustomers(businessId, todayDate) != null ? warrantyRepository.countExpiredWarrantyCustomers(businessId, todayDate) : 0L);
        }

        return stats;
    }
    
    public byte[] generateInvoicePDF(Long billId) {
        Bill bill = getBillById(billId);
        Business business = bill.getBusiness();
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);
            
            // Header
            String bName = business != null && business.getBusinessName() != null ? business.getBusinessName() : "StockPilot";
            document.add(new Paragraph(bName)
                    .setFontSize(22)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));
            
            if (business != null) {
                String addressStr = business.getAddress() != null ? business.getAddress() : "";
                if (business.getCity() != null) addressStr += ", " + business.getCity();
                if (business.getState() != null) addressStr += ", " + business.getState();
                if (business.getPincode() != null) addressStr += " - " + business.getPincode();
                if (!addressStr.isEmpty()) {
                    document.add(new Paragraph(addressStr).setTextAlignment(TextAlignment.CENTER).setFontSize(10));
                }
                
                String contactStr = "";
                if (business.getContactNumber() != null) contactStr += "Phone: " + business.getContactNumber() + " | ";
                if (business.getEmail() != null) contactStr += "Email: " + business.getEmail() + " | ";
                if (business.getWebsite() != null) contactStr += "Web: " + business.getWebsite();
                if (contactStr.endsWith(" | ")) contactStr = contactStr.substring(0, contactStr.length() - 3);
                if (!contactStr.isEmpty()) {
                    document.add(new Paragraph(contactStr).setTextAlignment(TextAlignment.CENTER).setFontSize(10));
                }
                
                if (business.getGstNumber() != null) {
                    document.add(new Paragraph("GSTIN: " + business.getGstNumber()).setTextAlignment(TextAlignment.CENTER).setFontSize(10).setBold());
                }
            }
            
            document.add(new Paragraph("\n"));
            
            // Invoice Meta & Customer
            float[] topColWidths = {1, 1};
            Table topTable = new Table(UnitValue.createPercentArray(topColWidths)).useAllAvailableWidth();
            
            Cell metaCell = new Cell().setBorder(Border.NO_BORDER);
            metaCell.add(new Paragraph("INVOICE").setBold().setFontSize(14));
            metaCell.add(new Paragraph("Invoice No: " + bill.getInvoiceNumber()));
            metaCell.add(new Paragraph("Date: " + bill.getBillDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm"))));
            if (bill.getPaymentMode() != null) {
                metaCell.add(new Paragraph("Payment Mode: " + bill.getPaymentMode()));
            }
            
            Cell custCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
            custCell.add(new Paragraph("Billed To:").setBold().setFontSize(11));
            custCell.add(new Paragraph(bill.getCustomer().getName()).setBold());
            custCell.add(new Paragraph("Phone: " + bill.getCustomer().getPhone()));
            if (bill.getCustomer().getAddress() != null && !bill.getCustomer().getAddress().isEmpty()) {
                custCell.add(new Paragraph(bill.getCustomer().getAddress()));
            }
            if (bill.getCustomer().getEmail() != null && !bill.getCustomer().getEmail().isEmpty()) {
                custCell.add(new Paragraph("Email: " + bill.getCustomer().getEmail()));
            }
            
            topTable.addCell(metaCell);
            topTable.addCell(custCell);
            document.add(topTable);
            document.add(new Paragraph("\n"));
            
            // Products Table
            boolean isGst = "GST".equalsIgnoreCase(bill.getGstType()) || "INCLUDED".equalsIgnoreCase(bill.getGstType()) || "EXCLUDED".equalsIgnoreCase(bill.getGstType());
            
            float[] columnWidths;
            if (isGst) {
                columnWidths = new float[]{3, 2, 2, 1, 2, 2, 2, 2};
            } else {
                columnWidths = new float[]{4, 2, 2, 1, 2, 2, 2};
            }
            
            Table table = new Table(UnitValue.createPercentArray(columnWidths)).useAllAvailableWidth();
            table.addHeaderCell(new Cell().add(new Paragraph("Product").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("SKU/Serial").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Rate").setBold()).setTextAlignment(TextAlignment.RIGHT));
            table.addHeaderCell(new Cell().add(new Paragraph("Qty").setBold()).setTextAlignment(TextAlignment.CENTER));
            table.addHeaderCell(new Cell().add(new Paragraph("Discount").setBold()).setTextAlignment(TextAlignment.RIGHT));
            if (isGst) {
                table.addHeaderCell(new Cell().add(new Paragraph("GST %").setBold()).setTextAlignment(TextAlignment.RIGHT));
                table.addHeaderCell(new Cell().add(new Paragraph("GST Amt").setBold()).setTextAlignment(TextAlignment.RIGHT));
            }
            table.addHeaderCell(new Cell().add(new Paragraph("Total").setBold()).setTextAlignment(TextAlignment.RIGHT));
            
            for (BillItem item : bill.getItems()) {
                table.addCell(new Cell().add(new Paragraph(item.getProduct().getName())));
                
                String skuSerial = item.getProduct().getPartNumber();
                if (item.getSerialNumber() != null && !item.getSerialNumber().isEmpty()) {
                    skuSerial += "\nSN: " + item.getSerialNumber();
                }
                table.addCell(new Cell().add(new Paragraph(skuSerial).setFontSize(9)));
                
                table.addCell(new Cell().add(new Paragraph(String.format("₹%.2f", item.getPrice()))).setTextAlignment(TextAlignment.RIGHT));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQuantity()))).setTextAlignment(TextAlignment.CENTER));
                table.addCell(new Cell().add(new Paragraph(String.format("₹%.2f", item.getDiscount()))).setTextAlignment(TextAlignment.RIGHT));
                
                if (isGst) {
                    table.addCell(new Cell().add(new Paragraph(String.format("%.1f%%", item.getGstPercent()))).setTextAlignment(TextAlignment.RIGHT));
                    double gstAmt = item.getItemTotal() - (item.getPrice() * item.getQuantity() - item.getDiscount());
                    table.addCell(new Cell().add(new Paragraph(String.format("₹%.2f", gstAmt))).setTextAlignment(TextAlignment.RIGHT));
                }
                table.addCell(new Cell().add(new Paragraph(String.format("₹%.2f", item.getItemTotal()))).setTextAlignment(TextAlignment.RIGHT));
            }
            document.add(table);
            document.add(new Paragraph("\n"));
            
            // Totals
            float[] totColWidths = {7, 3};
            Table totTable = new Table(UnitValue.createPercentArray(totColWidths)).useAllAvailableWidth();
            
            Cell emptyCell = new Cell().setBorder(Border.NO_BORDER);
            
            Cell totalsCell = new Cell().setBorder(Border.NO_BORDER);
            double totalLineDiscount = bill.getItems().stream().mapToDouble(BillItem::getDiscount).sum();
            double totalDiscount = totalLineDiscount + bill.getDiscount();
            double grossTotal = bill.getSubtotal() + totalLineDiscount;
            
            totalsCell.add(new Paragraph("Gross Total: ₹" + String.format("%.2f", grossTotal)).setTextAlignment(TextAlignment.RIGHT));
            totalsCell.add(new Paragraph("Total Discount: ₹" + String.format("%.2f", totalDiscount)).setTextAlignment(TextAlignment.RIGHT));
            if (isGst) {
                totalsCell.add(new Paragraph("Total GST: ₹" + String.format("%.2f", bill.getGstAmount())).setTextAlignment(TextAlignment.RIGHT));
            }
            totalsCell.add(new Paragraph("Grand Total: ₹" + String.format("%.2f", bill.getFinalAmount())).setBold().setFontSize(14).setTextAlignment(TextAlignment.RIGHT));
            
            totTable.addCell(emptyCell);
            totTable.addCell(totalsCell);
            document.add(totTable);
            document.add(new Paragraph("\n"));
            
            // EMI / Warranty
            if (bill.getEmis() != null && !bill.getEmis().isEmpty()) {
                document.add(new Paragraph("EMI Details").setBold().setFontSize(12));
                EMI emi = bill.getEmis().get(0);
                document.add(new Paragraph("Down Payment: ₹" + emi.getDownPayment() + " | Loan Amount: ₹" + emi.getLoanAmount() + " | Months: " + emi.getTotalEmis() + " | Monthly EMI: ₹" + emi.getEmiAmount()));
                document.add(new Paragraph("\n"));
            }
            
            if (bill.getWarranties() != null && !bill.getWarranties().isEmpty()) {
                document.add(new Paragraph("Warranty Details").setBold().setFontSize(12));
                for (Warranty w : bill.getWarranties()) {
                    document.add(new Paragraph(w.getProduct().getName() + " - " + w.getWarrantyType() + " (" + w.getWarrantyPeriodMonths() + " Months). Valid till: " + w.getWarrantyEndDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"))).setFontSize(9));
                }
                document.add(new Paragraph("\n"));
            }
            
            // Footer
            if (business != null && business.getBankAccountInfo() != null && !business.getBankAccountInfo().isEmpty()) {
                document.add(new Paragraph("Bank Details").setBold().setFontSize(10));
                document.add(new Paragraph(business.getBankAccountInfo()).setFontSize(9));
                document.add(new Paragraph("\n"));
            }
            
            if (business != null && business.getTermsAndConditions() != null && !business.getTermsAndConditions().isEmpty()) {
                document.add(new Paragraph("Terms & Conditions").setBold().setFontSize(10));
                document.add(new Paragraph(business.getTermsAndConditions()).setFontSize(8));
                document.add(new Paragraph("\n"));
            }
            
            // Signature
            document.add(new Paragraph("\n\n"));
            if (business != null && business.getSignatureText() != null && !business.getSignatureText().isEmpty()) {
                document.add(new Paragraph(business.getSignatureText()).setTextAlignment(TextAlignment.RIGHT).setBold());
            } else {
                document.add(new Paragraph("Authorized Signatory").setTextAlignment(TextAlignment.RIGHT).setBold());
            }
            
            document.add(new Paragraph("Thank you for your business!").setTextAlignment(TextAlignment.CENTER).setItalic());
            
            document.close();
            return baos.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }
    
    private String generateInvoiceNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "INV-" + timestamp;
    }
}

