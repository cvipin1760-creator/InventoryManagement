package com.spareparts.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "billing_counters")
@EqualsAndHashCode(callSuper = true)
public class BillingCounter extends BelongsToBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g. "Counter 1"

    @Column(nullable = false)
    private String status; // "OPEN", "CLOSED", "IDLE"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_cashier_id")
    private User currentCashier;
}
