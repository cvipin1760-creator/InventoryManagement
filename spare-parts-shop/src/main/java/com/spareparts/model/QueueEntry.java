package com.spareparts.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "queue_entries")
public class QueueEntry implements BelongsToBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id")
    @JsonIgnore
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_counter_id", nullable = false)
    private BillingCounter billingCounter;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String tokenNumber;

    @Column(nullable = false)
    private String status; // "WAITING", "SERVING", "COMPLETED", "CANCELLED"

    private Integer estimatedWaitTimeMinutes;

    @Column(nullable = false)
    private LocalDateTime joinTime;
    
    private LocalDateTime serviceTime;
}
