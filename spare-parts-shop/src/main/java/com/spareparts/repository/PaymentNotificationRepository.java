package com.spareparts.repository;

import com.spareparts.model.PaymentNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentNotificationRepository extends JpaRepository<PaymentNotification, Long> {
    List<PaymentNotification> findByBusinessId(Long businessId);
    List<PaymentNotification> findByBusinessIdAndIsReadFalse(Long businessId);
}
