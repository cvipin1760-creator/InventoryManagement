package com.spareparts.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class License {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "business_id")
    private Business business;
    
    @Column(unique = true)
    private String licenseKey;
    
    private String status;
    private LocalDateTime activatedAt;
    private LocalDateTime expiresAt;
}
