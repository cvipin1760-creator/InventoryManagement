package com.spareparts.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "manager_approval_requests")
@EqualsAndHashCode(callSuper = true)
public class ManagerApprovalRequest extends BelongsToBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(nullable = false)
    private String actionType; // e.g., "HIGH_DISCOUNT", "REFUND", "VOID_BILL"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String detailsJson; // JSON representation of the request context

    @Column(nullable = false)
    private String status; // "PENDING", "APPROVED", "REJECTED"

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime respondedAt;
}
