package com.spareparts.repository;

import com.spareparts.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    @Query("SELECT c FROM Customer c WHERE c.business.id = :businessId AND (:branchId IS NULL OR c.branch.id = :branchId)")
    List<Customer> findByBusinessId(@Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT c FROM Customer c WHERE c.business.id = :businessId AND (:branchId IS NULL OR c.branch.id = :branchId) AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR c.phone LIKE CONCAT('%', :keyword, '%'))")
    List<Customer> searchCustomers(@Param("keyword") String keyword, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT c FROM Customer c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR c.phone LIKE CONCAT('%', :keyword, '%')")
    List<Customer> searchCustomers(@Param("keyword") String keyword);
}
