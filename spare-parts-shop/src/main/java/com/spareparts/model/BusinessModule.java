package com.spareparts.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class BusinessModule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "business_id")
    private Business business;
    
    @ManyToOne
    @JoinColumn(name = "module_id")
    private ModuleDefinition module;
    
    private Boolean isEnabled = true;
    private Boolean isTrial = false;
    
    private LocalDateTime trialEndDate;
    private LocalDateTime expiryDate;
}
