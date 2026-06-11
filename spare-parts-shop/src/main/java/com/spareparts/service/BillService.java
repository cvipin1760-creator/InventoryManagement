package com.spareparts.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.spareparts.dto.BillItemRequest;
import com.spareparts.dto.BillRequest;
import com.spareparts.dto.DashboardStats;
import com.spareparts.model.Bill;
import com.spareparts.model.BillItem;
import com.spareparts.model.Customer;
import com.spareparts.model.Payment;
import com.spareparts.model.Product;
import com.spareparts.repository.BillRepository;
import com.spareparts.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class BillService {
    
    @Autowired
    private BillRepository billRepository;
    
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private ProductService productService;

    @Autowired
    private PaymentRepository paymentRepository;
    
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }
    
    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with id: " + id));
    }
    
    @Transactional
    public Bill createBill(BillRequest request) {
        Customer customer = customerService.getCustomerById(request.getCustomerId());
        
        Bill bill = new Bill();
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

        Bill savedBill = billRepository.save(bill);
        if (request.getPaidAmount() != null && request.getPaidAmount() > 0) {
            Payment payment = new Payment();
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
        return billRepository.findBillsBetweenDates(startDate, endDate);
    }
    
    public List<Bill> searchBillsByCustomerName(String customerName) {
        return billRepository.findByCustomerName(customerName);
    }
    
    public List<Bill> searchBillsByProductKeyword(String keyword) {
        return billRepository.findByProductKeyword(keyword);
    }

    public Map<Long, Double> getLatestCustomerProductPrices(Long customerId) {
        customerService.getCustomerById(customerId);

        Map<Long, Double> latestPrices = new LinkedHashMap<>();
        for (Object[] row : billRepository.findCustomerProductPriceHistory(customerId)) {
            Long productId = (Long) row[0];
            Double price = (Double) row[1];
            latestPrices.putIfAbsent(productId, price);
        }
        return latestPrices;
    }
    
    public DashboardStats getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.with(LocalTime.MIN);
        LocalDateTime todayEnd = now.with(LocalTime.MAX);
        LocalDateTime weekStart = now.minusDays(7);
        LocalDateTime monthStart = now.minusDays(30);
        
        Double todaySales = billRepository.getTotalSalesBetweenDates(todayStart, todayEnd);
        Double weeklySales = billRepository.getTotalSalesBetweenDates(weekStart, now);
        Double monthlySales = billRepository.getTotalSalesBetweenDates(monthStart, now);
        Long todayBillsCount = billRepository.countBillsBetweenDates(todayStart, todayEnd);
        
        List<Product> lowStockProducts = productService.getLowStockProducts();
        
        return new DashboardStats(
                todaySales,
                weeklySales,
                monthlySales,
                todayBillsCount,
                lowStockProducts.size()
        );
    }
    
    public byte[] generateInvoicePDF(Long billId) {
        Bill bill = getBillById(billId);
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);
            
            document.add(new Paragraph("StockPilot")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("Shop Address: Kalamboli")
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("Phone: +91-9967015781")
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("\n"));
            
            document.add(new Paragraph("Invoice Number: " + bill.getInvoiceNumber()).setBold());
            document.add(new Paragraph("Date: " + bill.getBillDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))));
            document.add(new Paragraph("\n"));
            
            document.add(new Paragraph("Customer Details:").setBold());
            document.add(new Paragraph("Name: " + bill.getCustomer().getName()));
            document.add(new Paragraph("Phone: " + bill.getCustomer().getPhone()));
            document.add(new Paragraph("Address: " + (bill.getCustomer().getAddress() != null ? bill.getCustomer().getAddress() : "N/A")));
            document.add(new Paragraph("\n"));
            
            float[] columnWidths = {4, 2, 2, 2, 2, 2};
            Table table = new Table(columnWidths);
            table.addHeaderCell("Product");
            table.addHeaderCell("Qty");
            table.addHeaderCell("Price");
            table.addHeaderCell("Disc.");
            table.addHeaderCell("GST %");
            table.addHeaderCell("Total");
            
            for (BillItem item : bill.getItems()) {
                table.addCell(item.getProduct().getName());
                table.addCell(String.valueOf(item.getQuantity()));
                table.addCell(String.format("₹%.2f", item.getPrice()));
                table.addCell(String.format("₹%.2f", item.getDiscount()));
                table.addCell(String.format("%.1f%%", item.getGstPercent()));
                table.addCell(String.format("₹%.2f", item.getItemTotal()));
            }
            
            document.add(table);
            document.add(new Paragraph("\n"));
            
            double totalLineDiscount = bill.getItems().stream().mapToDouble(BillItem::getDiscount).sum();
            double totalDiscount = totalLineDiscount + bill.getDiscount();
            double grossTotal = bill.getSubtotal() + totalLineDiscount;

            document.add(new Paragraph("Gross Total: ₹" + String.format("%.2f", grossTotal)));
            document.add(new Paragraph("Total Discount: ₹" + String.format("%.2f", totalDiscount)));
            document.add(new Paragraph("GST Amount: ₹" + String.format("%.2f", bill.getGstAmount())));
            document.add(new Paragraph("Final Amount: ₹" + String.format("%.2f", bill.getFinalAmount())).setBold().setFontSize(14));
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("GST Type: " + bill.getGstType()));
            document.add(new Paragraph("\n\nThank you for your business!").setTextAlignment(TextAlignment.CENTER));
            
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
