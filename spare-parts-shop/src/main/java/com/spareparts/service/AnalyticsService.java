package com.spareparts.service;

import com.spareparts.dto.AdminPerformance;
import com.spareparts.dto.SaaSMetrics;
import com.spareparts.model.Business;
import com.spareparts.model.Subscription;
import com.spareparts.repository.BusinessRepository;
import com.spareparts.repository.SubscriptionRepository;
import com.spareparts.repository.BillRepository;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    public SaaSMetrics getSaaSMetrics() {
        SaaSMetrics metrics = new SaaSMetrics();
        
        List<Business> allBusinesses = businessRepository.findAll();
        metrics.setTotalBusinesses(allBusinesses.size());
        
        // Mocking some values for now to avoid complex queries across multiple tenant tables in one go
        metrics.setActiveBusinesses((int) (allBusinesses.size() * 0.8)); // 80% active
        metrics.setNewBusinesses(5);
        
        List<Subscription> subscriptions = subscriptionRepository.findAll();
        
        long premiumCount = subscriptions.stream().filter(s -> "Premium".equalsIgnoreCase(s.getPlanName())).count();
        metrics.setPremiumBusinesses((int) premiumCount);
        
        long trialCount = subscriptions.stream().filter(s -> "Trial".equalsIgnoreCase(s.getPlanName())).count();
        metrics.setTrialBusinesses((int) trialCount);
        
        long expiredCount = subscriptions.stream().filter(s -> "Expired".equalsIgnoreCase(s.getPlanName()) || "Canceled".equalsIgnoreCase(s.getStatus())).count();
        metrics.setExpiredBusinesses((int) expiredCount);

        BigDecimal mrr = subscriptions.stream()
                .filter(s -> "Active".equalsIgnoreCase(s.getStatus()))
                .map(Subscription::getMonthlyPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        metrics.setMonthlyMrr(mrr);
        metrics.setAnnualArr(mrr.multiply(new BigDecimal("12")));

        // Global stats
        metrics.setLiveGlobalSales(new BigDecimal("14250000")); // Mocked large number
        metrics.setBusinessGrowth(24.0);
        metrics.setActiveUsersToday((int) userRepository.count());

        return metrics;
    }

    public List<AdminPerformance> getAdminPerformances() {
        List<AdminPerformance> performances = new ArrayList<>();
        List<Business> businesses = businessRepository.findAll();

        for (Business b : businesses) {
            AdminPerformance ap = new AdminPerformance();
            ap.setBusinessName(b.getBusinessName());
            
            // Assume the first user is the admin (for simplification)
            ap.setAdminName("Admin of " + b.getBusinessName());
            
            // Fetch subscription
            subscriptionRepository.findByBusinessId(b.getId()).ifPresentOrElse(sub -> {
                ap.setSubscriptionPlan(sub.getPlanName());
                ap.setStatus(sub.getStatus());
            }, () -> {
                ap.setSubscriptionPlan("Free");
                ap.setStatus("Active");
            });

            ap.setRevenue(new BigDecimal("150000")); // Mocks for now
            ap.setCustomers(150);
            ap.setHealthScore(90);

            performances.add(ap);
        }

        return performances;
    }
}
