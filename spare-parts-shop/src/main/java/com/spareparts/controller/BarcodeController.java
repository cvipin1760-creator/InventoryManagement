package com.spareparts.controller;

import com.spareparts.model.BarcodePrintHistory;
import com.spareparts.model.BarcodeTemplate;
import com.spareparts.model.Product;
import com.spareparts.service.BarcodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/barcode")
@RequiredArgsConstructor
public class BarcodeController {

    private final BarcodeService barcodeService;

    @GetMapping("/templates")
    public ResponseEntity<List<BarcodeTemplate>> getTemplates() {
        return ResponseEntity.ok(barcodeService.getTemplates());
    }

    @PostMapping("/templates")
    public ResponseEntity<BarcodeTemplate> saveTemplate(@RequestBody BarcodeTemplate template) {
        return ResponseEntity.ok(barcodeService.saveTemplate(template));
    }

    @PostMapping("/generate/{productId}")
    public ResponseEntity<Product> generateBarcodeForProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(barcodeService.generateBarcodeForProduct(productId));
    }

    @PostMapping("/generate-bulk")
    public ResponseEntity<Map<String, Integer>> generateMissingBarcodes() {
        int count = barcodeService.generateMissingBarcodes();
        return ResponseEntity.ok(Map.of("generatedCount", count));
    }

    @PostMapping("/print")
    public ResponseEntity<Void> recordPrintHistory(@RequestBody Map<String, Object> payload, @RequestAttribute("userId") Long userId) {
        Long productId = Long.valueOf(payload.get("productId").toString());
        Integer copies = (Integer) payload.get("copies");
        String templateUsed = (String) payload.get("templateUsed");
        
        barcodeService.recordPrintHistory(productId, copies, templateUsed, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    public ResponseEntity<Page<BarcodePrintHistory>> getPrintHistory(Pageable pageable) {
        return ResponseEntity.ok(barcodeService.getPrintHistory(pageable));
    }
}
