package com.spareparts.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "warranties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Warranty implements BelongsToBusiness {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "business_id", nullable = false)
    @JsonIgnore
    private Business business;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Bill bill;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "serial_number")
    private String serialNumber;

    @Column(name = "model_number")
    private String modelNumber;

    @Column(name = "warranty_type", nullable = false)
    private String warrantyType = "NO_WARRANTY"; // NO_WARRANTY, MANUFACTURER, SELLER, EXTENDED, CUSTOM

    @Column(name = "warranty_start_date", nullable = false)
    private LocalDate warrantyStartDate;

    @Column(name = "warranty_end_date", nullable = false)
    private LocalDate warrantyEndDate;

    @Column(name = "warranty_period_months")
    private Integer warrantyPeriodMonths;

    @Column(name = "warranty_notes")
    private String warrantyNotes;

    @Column(name = "warranty_terms")
    private String warrantyTerms;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
