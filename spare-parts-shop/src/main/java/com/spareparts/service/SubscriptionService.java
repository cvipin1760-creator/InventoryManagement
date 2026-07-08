package com.spareparts.service;

import com.spareparts.model.Subscription;
import com.spareparts.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    /**
     * Run every day at midnight to check for expired subscriptions.
     * If a subscription's endDate has passed, mark it as EXPIRED.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void checkExpiredSubscriptions() {
        log.info("Running scheduled job to check for expired subscriptions...");
        LocalDateTime now = LocalDateTime.now();
        List<Subscription> activeSubscriptions = subscriptionRepository.findAll().stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()) || "TRIAL".equalsIgnoreCase(s.getStatus()))
                .filter(s -> s.getEndDate() != null && s.getEndDate().isBefore(now))
                .toList();

        for (Subscription subscription : activeSubscriptions) {
            log.info("Subscription for Business ID {} has expired. Updating status to EXPIRED.", subscription.getBusiness().getId());
            subscription.setStatus("EXPIRED");
            subscriptionRepository.save(subscription);
        }
        log.info("Expired subscriptions check completed.");
    }

    public Subscription getSubscriptionByBusinessId(Long businessId) {
        return subscriptionRepository.findByBusinessId(businessId).orElse(null);
    }
}
