package com.spareparts.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private String type; // e.g., TRIAL_EXPIRING_SOON, TRIAL_EXPIRED, RENEWAL_REMINDER

    @Column(nullable = false)
    private String message;

    @Column(name = "is_read", columnDefinition = "boolean default false")
    private Boolean isRead = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
