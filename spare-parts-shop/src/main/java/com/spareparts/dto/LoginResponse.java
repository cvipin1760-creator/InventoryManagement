package com.spareparts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private FeaturePermissionsDto features;
    private java.util.Set<String> permissions;
    private String message;
    private String token; // For backward compatibility

    public LoginResponse(Long userId, String username, String role, Long businessId, Long branchId, FeaturePermissionsDto features, String message) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.businessId = businessId;
        this.branchId = branchId;
        this.mustChangePassword = false;
        this.features = features;
        this.permissions = new java.util.HashSet<>();
        this.message = message;
        this.token = null;
    }

    public LoginResponse(Long userId, String username, String role, Long businessId, Long branchId, Boolean mustChangePassword, FeaturePermissionsDto features, String message) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.businessId = businessId;
        this.branchId = branchId;
        this.mustChangePassword = mustChangePassword;
        this.features = features;
        this.permissions = new java.util.HashSet<>();
        this.message = message;
        this.token = null;
    }

    public LoginResponse(Long userId, String username, String role, Long businessId, FeaturePermissionsDto features, String message) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.businessId = businessId;
        this.branchId = null;
        this.mustChangePassword = false;
        this.features = features;
        this.permissions = new java.util.HashSet<>();
        this.message = message;
        this.token = null;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeaturePermissionsDto {
        private Boolean inventoryEnabled;
        private Boolean billingEnabled;
        private Boolean warrantyEnabled;
        private Boolean emiEnabled;
        private Boolean gstEnabled;
        private Boolean customerPortalEnabled;
        private Boolean reportsEnabled;
        private Boolean whatsappNotificationsEnabled;
        private Boolean smsNotificationsEnabled;
        private Boolean multiUserSupportEnabled;
        private Boolean employeeManagementEnabled;
        private Boolean multiBranchEnabled;
        private Boolean webSocketsEnabled;
        private Boolean aiAnalyticsEnabled;
        private Boolean accountingExportEnabled;
        private Boolean marketingEnabled;
    }
}
