package com.spareparts.aspect;

import com.spareparts.config.TenantContext;
import com.spareparts.exception.LimitExceededException;
import com.spareparts.model.Subscription;
import com.spareparts.repository.BillRepository;
import com.spareparts.repository.BranchRepository;
import com.spareparts.repository.SubscriptionRepository;
import com.spareparts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.YearMonth;

@Aspect
@Component
@RequiredArgsConstructor
public class UsageLimitChecker {

    private final SubscriptionRepository subscriptionRepository;
    private final BillRepository billRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;

    @Before("@annotation(enforceUsageLimit)")
    public void checkUsageLimit(JoinPoint joinPoint, EnforceUsageLimit enforceUsageLimit) {
        Long businessId = TenantContext.getBusinessId();
        
        // Skip limit checks if not in a tenant context (e.g., SuperAdmin actions)
        if (businessId == null) {
            return;
        }

        Subscription subscription = subscriptionRepository.findByBusinessId(businessId)
                .orElse(null);

        if (subscription == null) {
            return; // No subscription record found, allow by default or handle appropriately
        }

        // Check if subscription is active
        if ("EXPIRED".equalsIgnoreCase(subscription.getStatus()) || "PAST_DUE".equalsIgnoreCase(subscription.getStatus())) {
            throw new LimitExceededException("Your subscription is " + subscription.getStatus() + ". Please upgrade or renew your plan.");
        }

        UsageLimitType limitType = enforceUsageLimit.value();

        switch (limitType) {
            case INVOICES:
                checkInvoiceLimit(businessId, subscription);
                break;
            case USERS:
                checkUserLimit(businessId, subscription);
                break;
            case BRANCHES:
                checkBranchLimit(businessId, subscription);
                break;
        }
    }

    private void checkInvoiceLimit(Long businessId, Subscription subscription) {
        if (subscription.getMaxInvoicesPerMonth() == null || subscription.getMaxInvoicesPerMonth() < 0) {
            return; // Unlimited
        }

        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // Count invoices for the business across all branches for the current month
        Long invoiceCount = billRepository.countBillsBetweenDates(startOfMonth, endOfMonth, businessId, null);

        if (invoiceCount >= subscription.getMaxInvoicesPerMonth()) {
            throw new LimitExceededException("Monthly invoice limit reached (" + subscription.getMaxInvoicesPerMonth() + "). Please upgrade your plan to create more invoices.");
        }
    }

    private void checkUserLimit(Long businessId, Subscription subscription) {
        if (subscription.getMaxUsers() == null || subscription.getMaxUsers() < 0) {
            return; // Unlimited
        }

        long userCount = userRepository.findByBusinessId(businessId).size();

        if (userCount >= subscription.getMaxUsers()) {
            throw new LimitExceededException("User limit reached (" + subscription.getMaxUsers() + "). Please upgrade your plan to add more users.");
        }
    }

    private void checkBranchLimit(Long businessId, Subscription subscription) {
        if (subscription.getMaxBranches() == null || subscription.getMaxBranches() < 0) {
            return; // Unlimited
        }

        long branchCount = branchRepository.findByBusinessId(businessId).size();

        if (branchCount >= subscription.getMaxBranches()) {
            throw new LimitExceededException("Branch limit reached (" + subscription.getMaxBranches() + "). Please upgrade your plan to add more branches.");
        }
    }
}
