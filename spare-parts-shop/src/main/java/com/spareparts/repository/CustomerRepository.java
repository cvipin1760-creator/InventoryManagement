package com.spareparts.repository;

import com.spareparts.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCustomerId(String customerId);
    @Query("SELECT c FROM Customer c WHERE c.business.id = :businessId AND (:branchId IS NULL OR c.branch.id = :branchId)")
    List<Customer> findByBusinessId(@Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT c FROM Customer c WHERE c.business.id = :businessId AND (:branchId IS NULL OR c.branch.id = :branchId) AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR c.phone LIKE CONCAT('%', :keyword, '%'))")
    List<Customer> searchCustomers(@Param("keyword") String keyword, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT c FROM Customer c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR c.phone LIKE CONCAT('%', :keyword, '%')")
    List<Customer> searchCustomers(@Param("keyword") String keyword);

    // Churned customers: have placed a bill but the most recent one is before the threshold date
    @Query("SELECT c FROM Customer c WHERE c.business.id = :businessId AND (:branchId IS NULL OR c.branch.id = :branchId) AND c.id IN (SELECT b.customer.id FROM Bill b WHERE b.business.id = :businessId AND (:branchId IS NULL OR b.branch.id = :branchId) GROUP BY b.customer.id HAVING MAX(b.billDate) < :thresholdDate)")
    List<Customer> findChurnedCustomers(@Param("businessId") Long businessId, @Param("branchId") Long branchId, @Param("thresholdDate") java.time.LocalDateTime thresholdDate);

    List<Customer> findByPhone(String phone);
}
