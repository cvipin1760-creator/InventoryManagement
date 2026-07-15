package com.spareparts.dto;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String username;
    private String email;
    private String password;
    private String role;
    private Boolean enabled;
    private java.util.Map<String, Boolean> permissions;

    // Optional fields for SaaS admin/business onboarding
    private String businessName;
    private String gstNumber;
    private String address;
    private String contactNumber;
    private String businessType;
    private String subscriptionPlan;
    
    // Configuration fields
    private String billingType;
    private String currency;
    private String timezone;
    private String financialYear;
    private String modulesJson;
    private String permissionsJson;
    private String invoiceSettingsJson;
    private String dashboardSettingsJson;
    private String notificationSettingsJson;
    private String themeJson;
}
