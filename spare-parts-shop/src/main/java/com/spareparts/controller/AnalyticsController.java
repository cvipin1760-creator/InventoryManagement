package com.spareparts.controller;

import com.spareparts.dto.AdminDashboardResponse;
import com.spareparts.dto.DetailedAnalyticsResponse;
import com.spareparts.repository.BillRepository;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.ProductRepository;
import com.spareparts.repository.EMIInstallmentRepository;
import com.spareparts.repository.WarrantyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EMIInstallmentRepository emiInstallmentRepository;

    @Autowired
    private WarrantyRepository warrantyRepository;

    @GetMapping("/full")
    @Cacheable("fullAnalytics")
    public ResponseEntity<DetailedAnalyticsResponse> getFullAnalytics(@RequestParam(required = false) Long branchId) {
        DetailedAnalyticsResponse response = new DetailedAnalyticsResponse();
        
        // Mocking arrays but getting real counts where possible
        long totalCustomers = customerRepository.count();
        long totalBills = billRepository.count();

        DetailedAnalyticsResponse.AnalyticsMetrics metrics = new DetailedAnalyticsResponse.AnalyticsMetrics();
        metrics.setTotalRevenue("₹1,24,580"); // Mock
        metrics.setTotalSales(String.valueOf(totalBills > 0 ? totalBills : 1234));
        metrics.setTotalCustomers(String.valueOf(totalCustomers > 0 ? totalCustomers : 345));
        metrics.setLowStockItems("18"); // Mock
        response.setMetrics(metrics);

        DetailedAnalyticsResponse.MonthlyRevenue m1 = new DetailedAnalyticsResponse.MonthlyRevenue(); m1.setMonth("Jan"); m1.setRevenue(4000);
        DetailedAnalyticsResponse.MonthlyRevenue m2 = new DetailedAnalyticsResponse.MonthlyRevenue(); m2.setMonth("Feb"); m2.setRevenue(3000);
        DetailedAnalyticsResponse.MonthlyRevenue m3 = new DetailedAnalyticsResponse.MonthlyRevenue(); m3.setMonth("Mar"); m3.setRevenue(5000);
        DetailedAnalyticsResponse.MonthlyRevenue m4 = new DetailedAnalyticsResponse.MonthlyRevenue(); m4.setMonth("Apr"); m4.setRevenue(4500);
        DetailedAnalyticsResponse.MonthlyRevenue m5 = new DetailedAnalyticsResponse.MonthlyRevenue(); m5.setMonth("May"); m5.setRevenue(6000);
        DetailedAnalyticsResponse.MonthlyRevenue m6 = new DetailedAnalyticsResponse.MonthlyRevenue(); m6.setMonth("Jun"); m6.setRevenue(8000);
        response.setRevenueData(Arrays.asList(m1, m2, m3, m4, m5, m6));

        DetailedAnalyticsResponse.TopProduct p1 = new DetailedAnalyticsResponse.TopProduct(); p1.setName("Engine Oil 5W-30"); p1.setSales("₹45,800"); p1.setCategory("Lubricants");
        DetailedAnalyticsResponse.TopProduct p2 = new DetailedAnalyticsResponse.TopProduct(); p2.setName("Brake Pads Front"); p2.setSales("₹32,400"); p2.setCategory("Brakes");
        DetailedAnalyticsResponse.TopProduct p3 = new DetailedAnalyticsResponse.TopProduct(); p3.setName("Air Filter"); p3.setSales("₹28,200"); p3.setCategory("Filters");
        response.setTopProducts(Arrays.asList(p1, p2, p3));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin-dashboard")
    @Cacheable("adminDashboard")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        AdminDashboardResponse response = new AdminDashboardResponse();
        
        response.setTodaySales(4500.0);
        response.setNetProfit(1200.0);
        response.setTotalCustomers((int)customerRepository.count());
        response.setNewCustomers(12);
        response.setTotalProducts((int)productRepository.count());
        response.setLowStockCount(5);
        response.setOutOfStockCount(2);
        response.setDeadStockCount(8);
        response.setCustomerGrowthPercent(15);

        // Calculate EMI & Warranty stats
        LocalDate today = LocalDate.now();
        LocalDate next30Days = today.plusDays(30);
        // Note: Since AnalyticsController is not tenant-aware yet (no business/branch context from auth),
        // we'll just use global mock-like queries for now, or 0 if not available
        // In a real multi-tenant scenario, we'd get business/branch from current user
        response.setTodayEMIDue(0L);
        response.setOverdueEMI(0L);
        response.setTotalEMICollection(0.0);
        response.setPendingEMIAmount(0.0);
        response.setUpcomingWarrantyExpiry(0L);
        response.setExpiredWarranty(0L);
        response.setActiveWarrantyCustomers(0L);
        response.setExpiredWarrantyCustomers(0L);

        AdminDashboardResponse.DailyRevenue d1 = new AdminDashboardResponse.DailyRevenue(); d1.setName("Mon"); d1.setRevenue(4000); d1.setProfit(2400);
        AdminDashboardResponse.DailyRevenue d2 = new AdminDashboardResponse.DailyRevenue(); d2.setName("Tue"); d2.setRevenue(3000); d2.setProfit(1398);
        AdminDashboardResponse.DailyRevenue d3 = new AdminDashboardResponse.DailyRevenue(); d3.setName("Wed"); d3.setRevenue(2000); d3.setProfit(9800);
        AdminDashboardResponse.DailyRevenue d4 = new AdminDashboardResponse.DailyRevenue(); d4.setName("Thu"); d4.setRevenue(2780); d4.setProfit(3908);
        AdminDashboardResponse.DailyRevenue d5 = new AdminDashboardResponse.DailyRevenue(); d5.setName("Fri"); d5.setRevenue(1890); d5.setProfit(4800);
        AdminDashboardResponse.DailyRevenue d6 = new AdminDashboardResponse.DailyRevenue(); d6.setName("Sat"); d6.setRevenue(2390); d6.setProfit(3800);
        AdminDashboardResponse.DailyRevenue d7 = new AdminDashboardResponse.DailyRevenue(); d7.setName("Sun"); d7.setRevenue(3490); d7.setProfit(4300);
        response.setRevenueData(Arrays.asList(d1, d2, d3, d4, d5, d6, d7));

        AdminDashboardResponse.CustomerData c1 = new AdminDashboardResponse.CustomerData(); c1.setName("New"); c1.setValue(400);
        AdminDashboardResponse.CustomerData c2 = new AdminDashboardResponse.CustomerData(); c2.setName("Returning"); c2.setValue(300);
        response.setCustomerData(Arrays.asList(c1, c2));

        AdminDashboardResponse.Activity a1 = new AdminDashboardResponse.Activity(); a1.setTime("09:15 AM"); a1.setText("New Admin Created"); a1.setColor("#3B82F6");
        AdminDashboardResponse.Activity a2 = new AdminDashboardResponse.Activity(); a2.setTime("09:05 AM"); a2.setText("Shop Created"); a2.setColor("#10B981");
        response.setRecentActivity(Arrays.asList(a1, a2));

        AdminDashboardResponse.NotificationAlert n1 = new AdminDashboardResponse.NotificationAlert(); n1.setTitle("Low Stock Alert"); n1.setDesc("Engine Oil below minimum threshold"); n1.setColor("warning");
        AdminDashboardResponse.NotificationAlert n2 = new AdminDashboardResponse.NotificationAlert(); n2.setTitle("Subscription Expired"); n2.setDesc("Shop Alpha's basic plan expired"); n2.setColor("error");
        response.setNotifications(Arrays.asList(n1, n2));

        return ResponseEntity.ok(response);
    }
}
