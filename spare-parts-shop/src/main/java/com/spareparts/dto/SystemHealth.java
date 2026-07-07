package com.spareparts.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealth {
    private String serverStatus; // e.g. "Operational"
    private String databaseStatus; // e.g. "Connected"
    private Long apiResponseTimeMs; // e.g. 45
    private Double storageUsagePercent; // e.g. 68.5
    private String backupStatus; // e.g. "Completed Today"
    private String emailServiceStatus; // e.g. "Operational"
    private String whatsappServiceStatus; // e.g. "Operational"
    private String paymentGatewayStatus; // e.g. "Operational"
}
