package com.spareparts.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "business_configurations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BusinessConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false, unique = true)
    private Business business;

    private String businessType;
    private String billingType;
    private String currency = "INR";
    private String timezone = "Asia/Kolkata";
    private String financialYear = "April-March";

    @Column(columnDefinition = "TEXT")
    private String modulesJson;

    @Column(columnDefinition = "TEXT")
    private String permissionsJson;

    @Column(columnDefinition = "TEXT")
    private String invoiceSettingsJson;

    @Column(columnDefinition = "TEXT")
    private String dashboardSettingsJson;

    @Column(columnDefinition = "TEXT")
    private String notificationSettingsJson;

    @Column(columnDefinition = "TEXT")
    private String themeJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    public void prePersistUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
