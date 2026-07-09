package com.spareparts.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class DetailedAnalyticsResponse {
    private List<MonthlyRevenue> revenueData;
    private AnalyticsMetrics metrics;
    private List<TopProduct> topProducts;
    
    @Data
    public static class MonthlyRevenue {
        private String month;
        private double revenue;
    }
    
    @Data
    public static class AnalyticsMetrics {
        private String totalRevenue;
        private String totalSales;
        private String totalCustomers;
        private String lowStockItems;
    }
    
    @Data
    public static class TopProduct {
        private String name;
        private String sales;
        private String category;
    }
}
