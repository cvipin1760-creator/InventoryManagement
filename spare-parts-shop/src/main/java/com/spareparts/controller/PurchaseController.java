package com.spareparts.controller;

import com.spareparts.dto.PurchaseRequest;
import com.spareparts.model.Purchase;
import com.spareparts.service.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    @GetMapping
    public ResponseEntity<List<Purchase>> getAllPurchases() {
        return ResponseEntity.ok(purchaseService.getAllPurchases());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Purchase> getPurchaseById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getPurchaseById(id));
    }

    @PostMapping
    public ResponseEntity<Purchase> createPurchase(@RequestBody PurchaseRequest request) {
        return ResponseEntity.ok(purchaseService.createPurchase(request));
    }

    @GetMapping("/by-date-range")
    public ResponseEntity<List<Purchase>> getPurchasesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(purchaseService.getPurchasesByDateRange(startDate, endDate));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Purchase>> searchPurchasesBySupplier(@RequestParam String supplierName) {
        return ResponseEntity.ok(purchaseService.searchPurchasesBySupplierName(supplierName));
    }
    
    @GetMapping("/search-by-product")
    public ResponseEntity<List<Purchase>> searchPurchasesByProduct(@RequestParam String keyword) {
        return ResponseEntity.ok(purchaseService.searchPurchasesByProduct(keyword));
    }
}
