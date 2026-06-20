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
    private FeaturePermissionsDto features;
    private String message;

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
    }
}
