package com.spareparts.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_gateways")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentGateway {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., Cashfree, Razorpay, Stripe

    @Column(name = "client_id")
    private String clientId;

    @Column(name = "secret_key")
    private String secretKey;
    
    @Column(name = "webhook_secret")
    private String webhookSecret;

    @Column(name = "environment")
    private String environment = "sandbox"; // sandbox or production

    @Column(name = "is_enabled", columnDefinition = "boolean default false")
    private Boolean isEnabled = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
