package com.spareparts.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cash_drawer_transactions")
public class CashDrawerTransaction implements BelongsToBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id")
    @JsonIgnore
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String type; // e.g., "ADD", "REMOVE", "SALE", "REFUND"

    private String reason; // e.g., "Cash dropped to safe", "Change added"

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
