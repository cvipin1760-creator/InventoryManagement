package com.spareparts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long userId;
    private String username;
    private String role;
    private Long businessId;
    private Long branchId;
    private Boolean mustChangePassword = false;
    private BusinessConfigurationDto configuration;
    private java.util.Set<String> permissions;
    private String message;
    private String token; // For backward compatibility

    public LoginResponse(Long userId, String username, String role, Long businessId, Long branchId, BusinessConfigurationDto configuration, String message) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.businessId = businessId;
        this.branchId = branchId;
        this.mustChangePassword = false;
        this.configuration = configuration;
        this.permissions = new java.util.HashSet<>();
        this.message = message;
        this.token = null;
    }

    public LoginResponse(Long userId, String username, String role, Long businessId, Long branchId, Boolean mustChangePassword, BusinessConfigurationDto configuration, String message) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.businessId = businessId;
        this.branchId = branchId;
        this.mustChangePassword = mustChangePassword;
        this.configuration = configuration;
        this.permissions = new java.util.HashSet<>();
        this.message = message;
        this.token = null;
    }

    public LoginResponse(Long userId, String username, String role, Long businessId, BusinessConfigurationDto configuration, String message) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.businessId = businessId;
        this.branchId = null;
        this.mustChangePassword = false;
        this.configuration = configuration;
        this.permissions = new java.util.HashSet<>();
        this.message = message;
        this.token = null;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusinessConfigurationDto {
        private String businessType;
        private String billingType;
        private String currency;
        private String timezone;
        private String financialYear;
        private List<Map<String, Object>> modules;
        private List<Map<String, Object>> permissions;
        private Map<String, Object> invoiceSettings;
        private Map<String, Object> dashboardSettings;
        private Map<String, Object> notificationSettings;
        private Map<String, Object> theme;
    }
}
