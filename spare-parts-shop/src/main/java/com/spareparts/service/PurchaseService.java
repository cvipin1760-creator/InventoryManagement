package com.spareparts.service;

import com.spareparts.dto.PurchaseItemRequest;
import com.spareparts.dto.PurchaseRequest;
import com.spareparts.model.Product;
import com.spareparts.model.Purchase;
import com.spareparts.model.PurchaseItem;
import com.spareparts.model.Supplier;
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
    
    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }
    
    public Purchase getPurchaseById(Long id) {
        return purchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase not found with id: " + id));
    }
    
    @Transactional
    public Purchase createPurchase(PurchaseRequest request) {
        Supplier supplier = supplierService.getSupplierById(request.getSupplierId());
        
        Purchase purchase = new Purchase();
        purchase.setInvoiceNumber(generateInvoiceNumber());
        purchase.setSupplier(supplier);
        purchase.setGstType(request.getGstType());
        purchase.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
        purchase.setAttachmentPath(request.getAttachmentPath());
        
        double subtotal = 0.0;
        double gstAmount = 0.0;
        List<PurchaseItem> purchaseItems = new ArrayList<>();
        
        for (PurchaseItemRequest itemReq : request.getItems()) {
            Product product = productService.getProductById(itemReq.getProductId());
            
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
        return purchaseRepository.findPurchasesBetweenDates(startDate, endDate);
    }
    
    public List<Purchase> searchPurchasesBySupplierName(String supplierName) {
        return purchaseRepository.findBySupplierName(supplierName);
    }
    
    public List<Purchase> searchPurchasesByProduct(String keyword) {
        return purchaseRepository.findByProductKeyword(keyword);
    }
    
    private String generateInvoiceNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "PUR-" + timestamp;
    }
}
