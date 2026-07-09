package com.spareparts.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    
    @Column(name = "assigned_to")
    private Long assignedToUserId;
    
    private String status; // "PENDING", "IN_PROGRESS", "COMPLETED"
    private String priority; // "LOW", "MEDIUM", "HIGH"
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id")
    private Business business;
}
