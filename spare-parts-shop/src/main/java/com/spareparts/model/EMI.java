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
@Table(name = "emis")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EMI {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "business_id", nullable = false)
    @JsonIgnore
    private Business business;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Bill bill;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "down_payment")
    private Double downPayment = 0.0;

    @Column(name = "loan_amount", nullable = false)
    private Double loanAmount;

    @Column(name = "total_emis", nullable = false)
    private Integer totalEmis;

    @Column(name = "emi_amount", nullable = false)
    private Double emiAmount;

    @Column(name = "emis_paid")
    private Integer emisPaid = 0;

    @Column(name = "emis_remaining")
    private Integer emisRemaining;

    @Column(name = "paid_amount")
    private Double paidAmount = 0.0;

    @Column(name = "remaining_amount", nullable = false)
    private Double remainingAmount;

    @Column(name = "first_emi_date")
    private LocalDate firstEmiDate;

    @Column(name = "next_emi_date")
    private LocalDate nextEmiDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
