package com.spareparts.service;

import com.spareparts.model.Business;
import com.spareparts.model.PaymentTransaction;
import com.spareparts.model.SubscriptionPlan;

public interface PaymentGatewayService {
    /**
     * Initializes a payment transaction with the gateway.
     * @param business The business making the payment.
     * @param plan The subscription plan being purchased.
     * @param transaction The local transaction record.
     * @return A gateway-specific response (e.g., checkout URL or session ID).
     */
    String initializePayment(Business business, SubscriptionPlan plan, PaymentTransaction transaction);

    /**
     * Verifies a payment signature/webhook payload.
     * @param payload The raw webhook payload.
     * @param signature The signature header from the gateway.
     * @return true if the signature is valid.
     */
    boolean verifySignature(String payload, String signature);

    /**
     * Fetches the current payment status from the gateway.
     * @param gatewayOrderId The gateway's order ID.
     * @return The status (e.g., SUCCESS, FAILED, PENDING).
     */
    String checkPaymentStatus(String gatewayOrderId);
}
