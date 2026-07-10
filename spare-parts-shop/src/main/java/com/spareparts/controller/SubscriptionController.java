package com.spareparts.controller;

import com.spareparts.config.TenantContext;
import com.spareparts.model.Subscription;
import com.spareparts.model.SubscriptionPlan;
import com.spareparts.repository.SubscriptionRepository;
import com.spareparts.repository.SubscriptionPlanRepository;
import com.spareparts.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @GetMapping("/plans")
    public ResponseEntity<java.util.List<SubscriptionPlan>> getAvailablePlans() {
        return ResponseEntity.ok(subscriptionPlanRepository.findAll());
    }

    @GetMapping("/current")
    public ResponseEntity<Subscription> getCurrentSubscription() {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Subscription subscription = subscriptionService.getSubscriptionByBusinessId(businessId);
        if (subscription == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/upgrade")
    public ResponseEntity<Subscription> upgradePlan(@RequestParam String planName) {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }

        Subscription subscription = subscriptionService.getSubscriptionByBusinessId(businessId);
        if (subscription == null) {
            return ResponseEntity.notFound().build();
        }

        // Mock payment logic - immediately upgrades
        subscription.setPlanName(planName);
        subscription.setStatus("ACTIVE");
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusMonths(1));

        SubscriptionPlan plan = subscriptionPlanRepository.findByName(planName).orElse(null);
        if (plan == null) {
            return ResponseEntity.badRequest().build();
        }

        subscription.setMonthlyPrice(plan.getMonthlyPrice());
        subscription.setMaxBranches(plan.getMaxBranches());
        subscription.setMaxUsers(plan.getMaxUsers());
        subscription.setMaxInvoicesPerMonth(plan.getMaxInvoices());

        Subscription updated = subscriptionRepository.save(subscription);
        return ResponseEntity.ok(updated);
    }
}
