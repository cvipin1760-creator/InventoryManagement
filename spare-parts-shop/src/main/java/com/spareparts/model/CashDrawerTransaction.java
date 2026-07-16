package com.spareparts.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cash_drawer_transactions")
@EqualsAndHashCode(callSuper = true)
public class CashDrawerTransaction extends BelongsToBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
