package com.spareparts.controller;

import com.spareparts.dto.BillRequest;
import com.spareparts.dto.DashboardStats;
import com.spareparts.model.Bill;
import com.spareparts.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class BillController {

    @Autowired
    private BillService billService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @GetMapping("/bills")
    public ResponseEntity<List<Bill>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @GetMapping("/bills/templates")
    public ResponseEntity<List<Map<String, Object>>> getBillTemplates() {
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "name", "Standard Invoice", "type", "standard"),
            Map.of("id", 2, "name", "Thermal Receipt (80mm)", "type", "thermal_80"),
            Map.of("id", 3, "name", "Thermal Receipt (58mm)", "type", "thermal_58")
        ));
    }

    @GetMapping("/bills/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    @PostMapping("/bills")
    public ResponseEntity<Bill> createBill(@RequestBody BillRequest request) {
        return ResponseEntity.ok(billService.createBill(request));
    }

    @PutMapping("/bills/{id}")
    public ResponseEntity<Bill> updateBill(@PathVariable Long id, @RequestBody BillRequest request) {
        return ResponseEntity.ok(billService.updateBill(id, request));
    }

    @GetMapping("/bills/by-date-range")
    public ResponseEntity<List<Bill>> getBillsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(billService.getBillsByDateRange(startDate, endDate));
    }

    @GetMapping("/bills/search")
    public ResponseEntity<List<Bill>> searchBills(@RequestParam String customerName) {
        return ResponseEntity.ok(billService.searchBillsByCustomerName(customerName));
    }
    
    @GetMapping("/bills/search-by-product")
    public ResponseEntity<List<Bill>> searchBillsByProduct(@RequestParam String keyword) {
        return ResponseEntity.ok(billService.searchBillsByProductKeyword(keyword));
    }

    @GetMapping("/bills/customer-prices")
    public ResponseEntity<Map<Long, Double>> getCustomerProductPrices(@RequestParam Long customerId) {
        return ResponseEntity.ok(billService.getLatestCustomerProductPrices(customerId));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(billService.getDashboardStats());
    }

    @GetMapping("/bills/{id}/invoice-pdf")
    public ResponseEntity<byte[]> getInvoicePdf(@PathVariable Long id) {
        byte[] pdfBytes = billService.generateInvoicePDF(id);
        Bill bill = billService.getBillById(id);
        String filename = "invoice-" + bill.getInvoiceNumber() + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    @PostMapping("/bills/upload")
    public ResponseEntity<String> uploadAttachment(@RequestParam("file") MultipartFile file) {
        try {
            Path root = Paths.get(uploadDir);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
            
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String filename = UUID.randomUUID().toString() + extension;
            Files.copy(file.getInputStream(), root.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            
            return ResponseEntity.ok(filename);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Could not upload file: " + e.getMessage());
        }
    }

    @GetMapping("/bills/attachments/{filename:.+}")
    public ResponseEntity<Resource> getAttachment(@PathVariable String filename) {
        try {
            Path file = Paths.get(uploadDir).resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
