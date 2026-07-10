package com.spareparts.dto;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String username;
    private String email;
    private String password;
    private String role;
    private Boolean enabled;

    // Optional fields for SaaS admin/business onboarding
    private String businessName;
    private String gstNumber;
    private String address;
    private String contactNumber;
    private String businessType;
    private String subscriptionPlan;
    private java.util.Map<String, Boolean> permissions;
}
