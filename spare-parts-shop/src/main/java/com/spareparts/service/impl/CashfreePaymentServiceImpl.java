package com.spareparts.service.impl;

import com.spareparts.model.Business;
import com.spareparts.model.PaymentTransaction;
import com.spareparts.model.SubscriptionPlan;
import com.spareparts.service.PaymentGatewayService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CashfreePaymentServiceImpl implements PaymentGatewayService {

    @Value("${cashfree.client.id:TEST1234}")
    private String clientId;

    @Value("${cashfree.secret.key:TEST_SECRET_KEY}")
    private String secretKey;

    @Value("${cashfree.environment:sandbox}")
    private String environment;

    @Override
    public String initializePayment(Business business, SubscriptionPlan plan, PaymentTransaction transaction) {
        // In a real scenario, this would make an HTTP call to Cashfree's API to create an order
        // and return the payment session ID. 
        // Here we return a mock session ID for sandbox testing.
        String mockSessionId = "session_" + UUID.randomUUID().toString();
        
        transaction.setGatewayOrderId("cf_order_" + UUID.randomUUID().toString());
        
        return mockSessionId;
    }

    @Override
    public boolean verifySignature(String payload, String signature) {
        // Implement Cashfree webhook signature verification here using the secretKey
        // For testing purposes, we return true if a signature is provided.
        return signature != null && !signature.isEmpty();
    }

    @Override
    public String checkPaymentStatus(String gatewayOrderId) {
        // Make API call to Cashfree to get the latest status
        // For sandbox, we can mock it
        return "SUCCESS";
    }
}
