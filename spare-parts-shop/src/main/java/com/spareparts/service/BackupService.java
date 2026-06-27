package com.spareparts.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spareparts.model.Bill;
import com.spareparts.model.Payment;
import com.spareparts.repository.BillRepository;
import com.spareparts.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class BackupService {
    private static final DateTimeFormatter FILE_TIMESTAMP = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${app.backup.dir:backups}")
    private String backupDir;

    @Transactional(readOnly = true)
    public Path createBillsBackup() {
        try {
            Files.createDirectories(Path.of(backupDir));

            Long businessId = com.spareparts.config.TenantContext.getBusinessId();
            List<Bill> bills;
            List<Payment> payments;
            if (businessId != null) {
                bills = billRepository.findByBusinessId(businessId, null);
                payments = paymentRepository.findByBusinessId(businessId, null);
            } else {
                bills = billRepository.findAll();
                payments = paymentRepository.findAll();
            }

            Map<String, Object> backup = new LinkedHashMap<>();
            backup.put("backupType", "BILLS_AND_PAYMENTS_JSON");
            backup.put("createdAt", LocalDateTime.now());
            backup.put("billCount", bills.size());
            backup.put("paymentCount", payments.size());
            backup.put("bills", bills);
            backup.put("payments", payments);

            Path backupPath = Path.of(backupDir, "bills-backup-" + LocalDateTime.now().format(FILE_TIMESTAMP) + ".json");
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(backupPath.toFile(), backup);
            return backupPath;
        } catch (IOException e) {
            throw new RuntimeException("Could not create bills backup: " + e.getMessage(), e);
        }
    }

    @Scheduled(cron = "0 55 23 * * *", zone = "Asia/Kolkata")
    public void createDailyBillsBackup() {
        createBillsBackup();
    }
}
