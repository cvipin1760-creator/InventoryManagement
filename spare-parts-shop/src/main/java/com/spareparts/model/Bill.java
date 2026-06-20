package com.spareparts.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    @JsonIgnore
    private Business business;
    
    @Column(name = "invoice_number", nullable = false)
    private String invoiceNumber;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    
    @Column(nullable = false)
    private Double subtotal;
    
    @Column(name = "gst_amount")
    private Double gstAmount = 0.0;
    
    @Column(nullable = false)
    private Double discount = 0.0;
    
    @Column(name = "final_amount", nullable = false)
    private Double finalAmount;
    
    @Column(name = "gst_type")
    private String gstType;
    
    @Column(name = "bill_date")
    private LocalDateTime billDate = LocalDateTime.now();
    
    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BillItem> items = new ArrayList<>();
}