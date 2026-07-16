package com.spareparts.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "suspended_carts")
@EqualsAndHashCode(callSuper = true)
public class SuspendedCart extends BelongsToBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cashier_id", nullable = false)
    private User cashier;

    private String customerName;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String cartDataJson;

    @Column(nullable = false)
    private LocalDateTime suspendedAt;
}
