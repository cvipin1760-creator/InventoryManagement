package com.spareparts.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaaSMetrics {
    // Top Bar
    private BigDecimal liveGlobalSales;
    private Double businessGrowth; // e.g., 24.0 for 24%
    private Integer activeUsersToday;

    // Business Metrics
    private Integer totalBusinesses;
    private Integer activeBusinesses;
    private Integer newBusinesses;
    private Integer trialBusinesses;
    private Integer premiumBusinesses;
    private Integer expiredBusinesses;
    private BigDecimal monthlyMrr;
    private BigDecimal annualArr;
}
