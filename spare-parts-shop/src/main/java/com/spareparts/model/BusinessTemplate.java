package com.spareparts.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "business_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BusinessTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String businessType;
    private String billingType;

    @Column(columnDefinition = "TEXT")
    private String modulesJson;

    @Column(columnDefinition = "TEXT")
    private String permissionsJson;

    @Column(columnDefinition = "TEXT")
    private String invoiceTemplate;

    @Column(columnDefinition = "TEXT")
    private String dashboardJson;

    @Column(columnDefinition = "TEXT")
    private String themeJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
