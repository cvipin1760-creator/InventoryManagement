package com.spareparts.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ModuleDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    private String name;
    private String description;
    private String category;
    private String icon;
    private String dependencies;
    private Double monthlyPrice;
    private Boolean isCore;
}
