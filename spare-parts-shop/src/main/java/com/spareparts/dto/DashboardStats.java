package com.spareparts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private Double todaySales;
    private Double weeklySales;
    private Double monthlySales;
    private Long todayBillsCount;
    private Integer lowStockCount;
    private Long totalProducts = 0L;
    
    // New Admin KPIs
    private Integer outOfStockCount = 0;
    private Integer deadStockCount = 0;
    private Integer fastMovingProductsCount = 0;
    private Double netProfit = 0.0;
    private Double gstCollected = 0.0;
    
    private Integer totalCustomers = 0;
    private Integer newCustomers = 0;
    private Integer activeCustomers = 0;
    private Double customerGrowthPercent = 0.0;
}