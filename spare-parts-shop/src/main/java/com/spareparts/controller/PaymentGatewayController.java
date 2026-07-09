package com.spareparts.controller;

import com.spareparts.config.TenantContext;
import com.spareparts.model.Business;
import com.spareparts.model.PaymentTransaction;
import com.spareparts.model.SubscriptionPlan;
import com.spareparts.repository.BusinessRepository;
import com.spareparts.repository.PaymentTransactionRepository;
import com.spareparts.repository.SubscriptionPlanRepository;
import com.spareparts.service.PaymentGatewayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@RestController
@RequestMapping("/api/payments/gateway")
@RequiredArgsConstructor
public class PaymentGatewayController {

    private final PaymentGatewayService paymentGatewayService;
    private final BusinessRepository businessRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ObjectMapper objectMapper;

    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> payload) {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No business context found");
        }

        Business business = businessRepository.findById(businessId).orElse(null);
        if (business == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Business not found");
        }

        Long planId = Long.valueOf(payload.get("planId").toString());
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId).orElse(null);
        if (plan == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Plan not found");
        }
        
        String term = payload.getOrDefault("term", "monthly").toString();
        BigDecimal amount = "yearly".equalsIgnoreCase(term) ? plan.getYearlyPrice() : plan.getMonthlyPrice();

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setBusiness(business);
        transaction.setPlan(plan);
        transaction.setAmount(amount);
        transaction.setCurrency("INR");
        transaction.setStatus("PENDING");
        
        // Initialize payment via Gateway (e.g. Cashfree Sandbox)
        String sessionId = paymentGatewayService.initializePayment(business, plan, transaction);
        
        paymentTransactionRepository.save(transaction);

        return ResponseEntity.ok(Map.of(
                "sessionId", sessionId,
                "orderId", transaction.getGatewayOrderId(),
                "amount", transaction.getAmount(),
                "currency", transaction.getCurrency()
        ));
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody String payload, @RequestHeader(value = "x-webhook-signature", required = false) String signature) {
        log.info("Received webhook payload: {}", payload);
        
        boolean isValid = paymentGatewayService.verifySignature(payload, signature);
        if (!isValid) {
            log.warn("Invalid webhook signature");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }
        
        try {
            JsonNode jsonNode = objectMapper.readTree(payload);
            String status = jsonNode.has("status") ? jsonNode.get("status").asText() : "";
            String orderId = jsonNode.has("order_id") ? jsonNode.get("order_id").asText() : "";

            if ("SUCCESS".equalsIgnoreCase(status) && !orderId.isEmpty()) {
                log.info("Mock webhook processing SUCCESS for order: {}", orderId);
                PaymentTransaction tx = paymentTransactionRepository.findByGatewayOrderId(orderId);
                if (tx != null) {
                    tx.setStatus("SUCCESS");
                    tx.setUpdatedAt(LocalDateTime.now());
                    paymentTransactionRepository.save(tx);
                    
                    // Activate subscription logic here
                }
            } else if ("FAILED".equalsIgnoreCase(status) && !orderId.isEmpty()) {
                PaymentTransaction tx = paymentTransactionRepository.findByGatewayOrderId(orderId);
                if (tx != null) {
                    tx.setStatus("FAILED");
                    tx.setUpdatedAt(LocalDateTime.now());
                    paymentTransactionRepository.save(tx);
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse webhook payload", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid JSON payload");
        }
        
        return ResponseEntity.ok("Webhook processed");
    }
}
