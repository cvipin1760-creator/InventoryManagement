package com.spareparts.controller;

import com.spareparts.service.AccountingExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/export")
public class AccountingExportController {

    @Autowired
    private AccountingExportService exportService;

    @GetMapping("/quickbooks")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_MANAGER')")
    public ResponseEntity<byte[]> exportQuickBooks(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        String csv = exportService.exportToQuickBooksCsv(startDate, endDate);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "quickbooks_export.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csv.getBytes());
    }

    @GetMapping("/tally")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_MANAGER')")
    public ResponseEntity<byte[]> exportTally(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        String xml = exportService.exportToTallyXml(startDate, endDate);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_XML);
        headers.setContentDispositionFormData("attachment", "tally_export.xml");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(xml.getBytes());
    }
}
