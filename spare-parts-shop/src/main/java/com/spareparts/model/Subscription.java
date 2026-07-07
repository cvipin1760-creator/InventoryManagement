package com.spareparts.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "subscriptions")
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private String planName; // e.g. "Basic", "Premium", "Enterprise"

    @Column(nullable = false)
    private BigDecimal monthlyPrice;

    @Column(nullable = false)
    private String status; // e.g. "ACTIVE", "PAST_DUE", "CANCELED", "TRIAL"

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Integer maxBranches;
    private Integer maxUsers;
    private Integer maxInvoicesPerMonth;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
