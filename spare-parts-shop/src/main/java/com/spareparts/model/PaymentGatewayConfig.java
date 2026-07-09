package com.spareparts.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_gateway_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentGatewayConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String gatewayName; // e.g., "STRIPE", "RAZORPAY", "CASHFREE"

    @Column(nullable = false)
    private String apiKey;

    @Column(nullable = false)
    private String apiSecret;

    @Column(nullable = false)
    private String webhookSecret;

    @Column(nullable = false)
    private Boolean isActive = false;
    
    @Column(nullable = false)
    private Boolean isSandbox = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
