package com.spareparts.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "shifts")
@EqualsAndHashCode(callSuper = true)
public class Shift extends BelongsToBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double openingBalance;

    private Double closingBalance;

    private Double cashDifference;

    @Column(nullable = false)
    private String status; // e.g., "OPEN", "CLOSED"

    @Column(nullable = false)
    private LocalDateTime startTime;

    private LocalDateTime endTime;
    
    private String notes;
}
