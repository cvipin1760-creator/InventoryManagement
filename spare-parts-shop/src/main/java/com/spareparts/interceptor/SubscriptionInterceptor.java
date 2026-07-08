package com.spareparts.interceptor;

import com.spareparts.config.TenantContext;
import com.spareparts.model.Subscription;
import com.spareparts.repository.SubscriptionRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SubscriptionInterceptor implements HandlerInterceptor {

    private final SubscriptionRepository subscriptionRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String method = request.getMethod();

        // Allow GET requests always
        if ("GET".equalsIgnoreCase(method)) {
            return true;
        }

        // Allow authentication, SaaS endpoints, and webhooks
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/") || path.startsWith("/api/saas/") || path.startsWith("/api/subscriptions/upgrade")) {
            return true;
        }

        Long businessId = TenantContext.getBusinessId();
        
        // If there's no businessId, let the request pass (might be super admin)
        if (businessId != null) {
            Optional<Subscription> subscriptionOpt = subscriptionRepository.findByBusinessId(businessId);
            
            if (subscriptionOpt.isPresent()) {
                Subscription subscription = subscriptionOpt.get();
                if ("EXPIRED".equalsIgnoreCase(subscription.getStatus()) || "PAST_DUE".equalsIgnoreCase(subscription.getStatus())) {
                    response.setStatus(HttpServletResponse.SC_PAYMENT_REQUIRED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Your subscription is " + subscription.getStatus() + ". Account is in read-only mode.\"}");
                    return false;
                }
            }
        }

        return true;
    }
}
