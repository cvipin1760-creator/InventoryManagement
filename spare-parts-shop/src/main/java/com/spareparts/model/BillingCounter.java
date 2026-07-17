package com.spareparts.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "billing_counters")
public class BillingCounter implements BelongsToBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id")
    @JsonIgnore
    private Business business;

    @Column(nullable = false)
    private String name; // e.g. "Counter 1"

    @Column(nullable = false)
    private String status; // "OPEN", "CLOSED", "IDLE"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_cashier_id")
    private User currentCashier;
}
