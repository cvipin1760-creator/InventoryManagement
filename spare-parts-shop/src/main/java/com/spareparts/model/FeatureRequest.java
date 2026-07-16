package com.spareparts.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class FeatureRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "business_id")
    private Business business;
    
    @ManyToOne
    @JoinColumn(name = "requested_by")
    private User requestedBy;
    
    private String featureCode;
    private String reason;
    private String priority;
    private String status = "PENDING";
    
    private LocalDateTime requestDate = LocalDateTime.now();
}
