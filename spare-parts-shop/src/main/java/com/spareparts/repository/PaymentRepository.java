package com.spareparts.repository;

import com.spareparts.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBusinessId(Long businessId);
    List<Payment> findByCustomerIdOrderByPaymentDateDesc(Long customerId);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.customer.id = :customerId AND p.business.id = :businessId")
    Double getTotalPaidByCustomerId(@Param("customerId") Long customerId, @Param("businessId") Long businessId);
    
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.customer.id = :customerId")
    Double getTotalPaidByCustomerId(@Param("customerId") Long customerId);
}
