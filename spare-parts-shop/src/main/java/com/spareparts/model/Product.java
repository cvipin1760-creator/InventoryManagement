package com.spareparts.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "part_number", nullable = false, unique = true)
    private String partNumber;
    
    @Column(name = "cost_price")
    private Double costPrice = 0.0;
    
    @Column(nullable = false)
    private Double price;
    
    @Column(name = "gst_percent", nullable = false)
    private Double gstPercent;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold = 10;
    
    @Column(name = "attachment_path")
    private String attachmentPath;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}