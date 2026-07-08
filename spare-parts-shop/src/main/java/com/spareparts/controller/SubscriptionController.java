package com.spareparts.controller;

import com.spareparts.config.TenantContext;
import com.spareparts.model.Subscription;
import com.spareparts.repository.SubscriptionRepository;
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

        if ("Basic".equalsIgnoreCase(planName)) {
            subscription.setMonthlyPrice(new BigDecimal("999"));
            subscription.setMaxBranches(1);
            subscription.setMaxUsers(3);
            subscription.setMaxInvoicesPerMonth(500);
        } else if ("Premium".equalsIgnoreCase(planName)) {
            subscription.setMonthlyPrice(new BigDecimal("2999"));
            subscription.setMaxBranches(3);
            subscription.setMaxUsers(10);
            subscription.setMaxInvoicesPerMonth(2000);
        } else if ("Enterprise".equalsIgnoreCase(planName)) {
            subscription.setMonthlyPrice(new BigDecimal("5999"));
            subscription.setMaxBranches(-1); // -1 for unlimited
            subscription.setMaxUsers(-1);
            subscription.setMaxInvoicesPerMonth(-1);
        } else {
            return ResponseEntity.badRequest().build();
        }

        Subscription updated = subscriptionRepository.save(subscription);
        return ResponseEntity.ok(updated);
    }
}
