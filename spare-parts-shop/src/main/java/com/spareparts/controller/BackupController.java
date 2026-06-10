package com.spareparts.controller;

import com.spareparts.service.BackupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/backups")
public class BackupController {
    @Autowired
    private BackupService backupService;

    @PostMapping("/bills/download")
    public ResponseEntity<ByteArrayResource> downloadBillsBackup() {
        try {
            Path backupPath = backupService.createBillsBackup();
            ByteArrayResource resource = new ByteArrayResource(Files.readAllBytes(backupPath));

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + backupPath.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Could not download bills backup: " + e.getMessage(), e);
        }
    }
}
