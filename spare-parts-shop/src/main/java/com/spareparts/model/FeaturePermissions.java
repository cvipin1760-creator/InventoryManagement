package com.spareparts.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "feature_permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FeaturePermissions implements BelongsToBusiness {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "business_id", nullable = false, unique = true)
    @JsonIgnore
    private Business business;

    @Column(name = "inventory_enabled")
    private Boolean inventoryEnabled = true;

    @Column(name = "billing_enabled")
    private Boolean billingEnabled = true;

    @Column(name = "warranty_enabled")
    private Boolean warrantyEnabled = false;

    @Column(name = "emi_enabled")
    private Boolean emiEnabled = false;

    @Column(name = "gst_enabled")
    private Boolean gstEnabled = true;

    @Column(name = "customer_portal_enabled")
    private Boolean customerPortalEnabled = false;

    @Column(name = "reports_enabled")
    private Boolean reportsEnabled = true;

    @Column(name = "whatsapp_notifications_enabled")
    private Boolean whatsappNotificationsEnabled = false;

    @Column(name = "sms_notifications_enabled")
    private Boolean smsNotificationsEnabled = false;

    @Column(name = "multi_user_support_enabled")
    private Boolean multiUserSupportEnabled = false;

    @Column(name = "employee_management_enabled")
    private Boolean employeeManagementEnabled = false;

    @Column(name = "multi_branch_enabled")
    private Boolean multiBranchEnabled = false;

    @Column(name = "web_sockets_enabled")
    private Boolean webSocketsEnabled = false;

    @Column(name = "ai_analytics_enabled")
    private Boolean aiAnalyticsEnabled = false;

    @Column(name = "accounting_export_enabled")
    private Boolean accountingExportEnabled = false;

    @Column(name = "marketing_enabled")
    private Boolean marketingEnabled = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
