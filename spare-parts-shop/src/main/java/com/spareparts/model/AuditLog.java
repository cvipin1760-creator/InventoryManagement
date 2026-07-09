package com.spareparts.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String entityName; // e.g., "Business", "User"

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false)
    private String action; // e.g., "CREATE", "UPDATE", "DELETE"

    @Column(nullable = false)
    private String performedBy; // Username of the person who performed the action

    @Column(columnDefinition = "TEXT")
    private String changes; // JSON string of changes or description

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id")
    private Business business; // For multi-tenant isolation

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
