package com.spareparts.dto;

import lombok.Data;
import java.util.List;

@Data
public class AdminDashboardResponse {
    private double todaySales;
    private double netProfit;
    private int totalCustomers;
    private int newCustomers;
    private int totalProducts;
    private int lowStockCount;
    private int outOfStockCount;
    private int deadStockCount;
    private int customerGrowthPercent;

    private List<DailyRevenue> revenueData;
    private List<CustomerData> customerData;
    private List<Activity> recentActivity;
    private List<NotificationAlert> notifications;

    @Data
    public static class DailyRevenue {
        private String name;
        private double revenue;
        private double profit;
    }

    @Data
    public static class CustomerData {
        private String name;
        private int value;
    }

    @Data
    public static class Activity {
        private String time;
        private String text;
        private String color;
    }

    @Data
    public static class NotificationAlert {
        private String title;
        private String desc;
        private String color;
    }
}
