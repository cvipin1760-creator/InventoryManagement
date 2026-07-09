package com.spareparts.service;

import com.spareparts.model.Business;
import com.spareparts.repository.BusinessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.spareparts.model.User;
import com.spareparts.repository.UserRepository;

@Service
public class SubscriptionCronService {

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    // Run every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void checkTrialAndSubscriptionExpiries() {
        List<Business> businesses = businessRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (Business business : businesses) {
            List<User> admins = userRepository.findByBusinessIdAndRole(business.getId(), "ADMIN");
            User systemSender = null; // Notifications can have a null sender for system messages or handled by service
            
            // Check trial expiry
            if ("TRIAL".equals(business.getSubscriptionStatus()) && business.getTrialEndDate() != null) {
                long daysRemaining = ChronoUnit.DAYS.between(now, business.getTrialEndDate());
                
                if (daysRemaining <= 0) {
                    business.setSubscriptionStatus("EXPIRED");
                    business.setIsSubscriptionActive(false);
                    for (User admin : admins) {
                        notificationService.sendNotificationToUser(systemSender, admin, "Trial Expired", "Your free trial has expired. Please purchase a subscription to continue using StockPilot.");
                    }
                } else if (daysRemaining == 7 || daysRemaining == 5 || daysRemaining == 3 || daysRemaining == 2 || daysRemaining == 1) {
                    for (User admin : admins) {
                        notificationService.sendNotificationToUser(systemSender, admin, "Trial Ending Soon", "Your free trial expires in " + daysRemaining + " days. Purchase a subscription to avoid interruption.");
                    }
                }
            }
            
            // Check active subscription expiry
            if (("ACTIVE".equals(business.getSubscriptionStatus()) || "GRACE_PERIOD".equals(business.getSubscriptionStatus())) && business.getSubscriptionEndDate() != null) {
                long daysRemaining = ChronoUnit.DAYS.between(now, business.getSubscriptionEndDate());
                
                if (daysRemaining <= -3) {
                    business.setSubscriptionStatus("EXPIRED");
                    business.setIsSubscriptionActive(false);
                    for (User admin : admins) {
                        notificationService.sendNotificationToUser(systemSender, admin, "Subscription Expired", "Your subscription and grace period have expired. Please renew to continue using StockPilot.");
                    }
                } else if (daysRemaining <= 0 && daysRemaining > -3) {
                    business.setSubscriptionStatus("GRACE_PERIOD");
                    long graceDaysLeft = 3 + daysRemaining; // daysRemaining is negative or 0
                    for (User admin : admins) {
                        notificationService.sendNotificationToUser(systemSender, admin, "Subscription Expired (Grace Period)", "Your subscription has expired. You have " + graceDaysLeft + " days of grace period remaining. Renew now to avoid losing write access.");
                    }
                } else if (daysRemaining == 7 || daysRemaining == 5 || daysRemaining == 3 || daysRemaining == 2 || daysRemaining == 1) {
                    for (User admin : admins) {
                        notificationService.sendNotificationToUser(systemSender, admin, "Subscription Ending Soon", "Your subscription expires in " + daysRemaining + " days. Renew now to avoid interruption.");
                    }
                }
            }
        }
        
        businessRepository.saveAll(businesses);
    }
}
