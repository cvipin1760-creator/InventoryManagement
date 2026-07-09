package com.spareparts.repository;

import com.spareparts.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByBusinessId(Long businessId);
    PaymentTransaction findByTransactionId(String transactionId);
    PaymentTransaction findByGatewayOrderId(String gatewayOrderId);
}
