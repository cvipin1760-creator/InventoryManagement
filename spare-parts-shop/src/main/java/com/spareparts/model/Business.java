package com.spareparts.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "businesses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Business {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String businessName;

    @Column(unique = true)
    private String gstNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String contactNumber;

    private String email;

    private String businessType;

    @Column(name = "logo_path")
    private String logoPath;
    
    private String city;
    private String state;
    private String pincode;
    private String website;
    
    @Column(name = "upi_id")
    private String upiId;
    
    @Column(name = "bank_account_info", columnDefinition = "TEXT")
    private String bankAccountInfo;
    
    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;
    
    @Column(name = "signature_text")
    private String signatureText;

    // AI / OpenRouter Settings
    @Column(name = "open_router_api_key")
    private String openRouterApiKey;

    @Column(name = "open_router_model")
    private String openRouterModel = "openai/gpt-4o";

    // Subscription fields
    @Column(nullable = false, columnDefinition = "varchar(255) default 'TRIAL'")
    private String subscriptionStatus = "TRIAL"; // TRIAL, ACTIVE, EXPIRED, CANCELED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_plan_id")
    private SubscriptionPlan currentPlan;

    private LocalDateTime trialStartDate;

    private LocalDateTime trialEndDate;

    @Column(columnDefinition = "varchar(255) default 'PENDING'")
    private String paymentStatus = "PENDING"; // PENDING, SUCCESS, FAILED

    private LocalDateTime subscriptionStartDate;

    private LocalDateTime subscriptionEndDate;

    @Column(columnDefinition = "boolean default true")
    private Boolean isSubscriptionActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public String getSubscriptionPlan() {
        return currentPlan != null ? currentPlan.getName() : subscriptionStatus;
    }

    public void setSubscriptionPlan(String plan) {
        this.subscriptionStatus = plan; // Hacky but keeps old code compiling
    }

    @PrePersist
    @PreUpdate
    public void prePersistUpdate() {
        // Convert empty string to null for gstNumber to avoid unique constraint violations
        if (gstNumber != null && gstNumber.trim().isEmpty()) {
            gstNumber = null;
        }
        
        // Auto-assign 7-day trial based on createdAt if not set
        if (trialStartDate == null) {
            trialStartDate = createdAt != null ? createdAt : LocalDateTime.now();
        }
        if (trialEndDate == null) {
            trialEndDate = trialStartDate.plusDays(7);
        }
        
        // Auto-expire trial if past end date and status is still TRIAL
        if ("TRIAL".equals(subscriptionStatus) && LocalDateTime.now().isAfter(trialEndDate)) {
            subscriptionStatus = "EXPIRED";
            isSubscriptionActive = false;
        }
    }
}
