package com.spareparts.repository;

import com.spareparts.model.PaymentWebhook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentWebhookRepository extends JpaRepository<PaymentWebhook, Long> {
}
