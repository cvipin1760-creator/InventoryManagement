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
}