package com.spareparts.service;

import com.spareparts.dto.PurchaseItemRequest;
import com.spareparts.dto.PurchaseRequest;
import com.spareparts.model.Product;
import com.spareparts.model.Purchase;
import com.spareparts.model.PurchaseItem;
import com.spareparts.model.Supplier;
import com.spareparts.model.Business;
import com.spareparts.model.Branch;
import com.spareparts.repository.PurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class PurchaseService {
    
    @Autowired
    private PurchaseRepository purchaseRepository;
    
    @Autowired
    private SupplierService supplierService;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private com.spareparts.repository.BusinessRepository businessRepository;

    @Autowired
    private com.spareparts.repository.BranchRepository branchRepository;

    public List<Purchase> getAllPurchases() {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return purchaseRepository.findByBusinessId(businessId, branchId);
    }
    
    public Purchase getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase not found with id: " + id));
        com.spareparts.config.TenantSecurity.checkAccess(purchase);
        return purchase;
    }
    
    @Transactional
    public Purchase createPurchase(PurchaseRequest request) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Business not found"));

        Supplier supplier = supplierService.getSupplierById(request.getSupplierId()); // Already checks tenant
        
        Purchase purchase = new Purchase();
        purchase.setBusiness(business);
        
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        if (branchId != null) {
            Branch branch = branchRepository.findById(branchId)
                    .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Branch not found"));
            purchase.setBranch(branch);
        }

        purchase.setInvoiceNumber(generateInvoiceNumber());
        purchase.setSupplier(supplier);
        purchase.setGstType(request.getGstType());
        purchase.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
        purchase.setAttachmentPath(request.getAttachmentPath());
        
        double subtotal = 0.0;
        double gstAmount = 0.0;
        List<PurchaseItem> purchaseItems = new ArrayList<>();
        
        for (PurchaseItemRequest itemReq : request.getItems()) {
            Product product = productService.getProductById(itemReq.getProductId()); // Already checks tenant
            
            PurchaseItem item = new PurchaseItem();
            item.setPurchase(purchase);
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
            purchaseItems.add(item);
            
            // INCREASE stock and UPDATE cost price when purchase is made
            product.setQuantity(product.getQuantity() + itemReq.getQuantity());
            product.setCostPrice(itemReq.getPrice());
            productService.updateProduct(product.getId(), product);
        }
        
        purchase.setItems(purchaseItems);
        purchase.setSubtotal(subtotal);
        purchase.setGstAmount(gstAmount);
        
        double finalAmount = "INCLUDED".equals(request.getGstType()) 
                ? subtotal - purchase.getDiscount() 
                : subtotal + gstAmount - purchase.getDiscount();
        
        purchase.setFinalAmount(finalAmount);
        purchase.setPurchaseDate(LocalDateTime.now());
        
        return purchaseRepository.save(purchase);
    }
    
    public List<Purchase> getPurchasesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return purchaseRepository.findPurchasesBetweenDates(startDate, endDate, businessId, branchId);
    }
    
    public List<Purchase> searchPurchasesBySupplierName(String supplierName) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return purchaseRepository.findBySupplierName(supplierName, businessId, branchId);
    }
    
    public List<Purchase> searchPurchasesByProduct(String keyword) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return purchaseRepository.findByProductKeyword(keyword, businessId, branchId);
    }
    
    private String generateInvoiceNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "PUR-" + timestamp;
    }
}
