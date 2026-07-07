package com.spareparts.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPerformance {
    private String adminName;
    private String businessName;
    private BigDecimal revenue;
    private Integer customers;
    private String subscriptionPlan;
    private Integer healthScore; // 0-100
    private String status; // Active, Warning
}
