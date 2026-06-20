package com.spareparts.model;

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

    // Subscription fields
    @Column(nullable = false)
    private String subscriptionPlan = "TRIAL"; // TRIAL, MONTHLY, YEARLY

    private LocalDateTime subscriptionStartDate;

    private LocalDateTime subscriptionEndDate;

    private Boolean isSubscriptionActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
