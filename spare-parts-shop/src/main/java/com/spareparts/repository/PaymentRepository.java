package com.spareparts.repository;

import com.spareparts.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @Query("SELECT p FROM Payment p WHERE p.business.id = :businessId AND (:branchId IS NULL OR p.branch.id = :branchId)")
    List<Payment> findByBusinessId(@Param("businessId") Long businessId, @Param("branchId") Long branchId);
    List<Payment> findByCustomerIdOrderByPaymentDateDesc(Long customerId);
    
    @Query("SELECT p FROM Payment p WHERE p.customer.id = :customerId AND p.business.id = :businessId AND (:branchId IS NULL OR p.branch.id = :branchId) ORDER BY p.paymentDate DESC")
    List<Payment> findByCustomerIdAndBusinessIdOrderByPaymentDateDesc(@Param("customerId") Long customerId, @Param("businessId") Long businessId, @Param("branchId") Long branchId);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.customer.id = :customerId AND p.business.id = :businessId AND (:branchId IS NULL OR p.branch.id = :branchId)")
    Double getTotalPaidByCustomerId(@Param("customerId") Long customerId, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.customer.id = :customerId")
    Double getTotalPaidByCustomerId(@Param("customerId") Long customerId);
}
