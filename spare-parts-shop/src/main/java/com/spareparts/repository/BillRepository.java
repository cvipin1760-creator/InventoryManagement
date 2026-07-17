package com.spareparts.repository;

import com.spareparts.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    @Query("SELECT b FROM Bill b WHERE b.business.id = :businessId AND (:branchId IS NULL OR b.branch.id = :branchId)")
    List<Bill> findByBusinessId(@Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    List<Bill> findByCustomerId(Long customerId);

    
    @Query("SELECT b FROM Bill b WHERE b.business.id = :businessId AND (:branchId IS NULL OR b.branch.id = :branchId) AND b.billDate BETWEEN :startDate AND :endDate ORDER BY b.billDate DESC")
    List<Bill> findBillsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT b FROM Bill b WHERE b.billDate BETWEEN :startDate AND :endDate ORDER BY b.billDate DESC")
    List<Bill> findBillsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT b FROM Bill b WHERE b.business.id = :businessId AND (:branchId IS NULL OR b.branch.id = :branchId) AND LOWER(b.customer.name) LIKE LOWER(CONCAT('%', :customerName, '%')) ORDER BY b.billDate DESC")
    List<Bill> findByCustomerName(@Param("customerName") String customerName, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT b FROM Bill b WHERE LOWER(b.customer.name) LIKE LOWER(CONCAT('%', :customerName, '%')) ORDER BY b.billDate DESC")
    List<Bill> findByCustomerName(@Param("customerName") String customerName);
    
    @Query("SELECT COALESCE(SUM(b.finalAmount), 0.0) FROM Bill b WHERE b.business.id = :businessId AND (:branchId IS NULL OR b.branch.id = :branchId) AND b.billDate BETWEEN :startDate AND :endDate")
    Double getTotalSalesBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT COALESCE(SUM(b.finalAmount), 0.0) FROM Bill b WHERE b.billDate BETWEEN :startDate AND :endDate")
    Double getTotalSalesBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(b) FROM Bill b WHERE b.business.id = :businessId AND (:branchId IS NULL OR b.branch.id = :branchId) AND b.billDate BETWEEN :startDate AND :endDate")
    Long countBillsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT COUNT(b) FROM Bill b WHERE b.billDate BETWEEN :startDate AND :endDate")
    Long countBillsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT DISTINCT b FROM Bill b JOIN b.items i JOIN i.product p WHERE b.business.id = :businessId AND (:branchId IS NULL OR b.branch.id = :branchId) AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.partNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY b.billDate DESC")
    List<Bill> findByProductKeyword(@Param("keyword") String keyword, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT DISTINCT b FROM Bill b JOIN b.items i JOIN i.product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.partNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY b.billDate DESC")
    List<Bill> findByProductKeyword(@Param("keyword") String keyword);

    @Query("SELECT i.product.id, i.price FROM Bill b JOIN b.items i WHERE b.customer.id = :customerId AND b.business.id = :businessId AND (:branchId IS NULL OR b.branch.id = :branchId) ORDER BY b.billDate DESC, b.id DESC, i.id DESC")
    List<Object[]> findCustomerProductPriceHistory(@Param("customerId") Long customerId, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT i.product.id, i.price FROM Bill b JOIN b.items i WHERE b.customer.id = :customerId ORDER BY b.billDate DESC, b.id DESC, i.id DESC")
    List<Object[]> findCustomerProductPriceHistory(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(b.finalAmount), 0.0) FROM Bill b WHERE b.customer.id = :customerId AND b.business.id = :businessId AND (:branchId IS NULL OR b.branch.id = :branchId)")
    Double getTotalBilledByCustomerId(@Param("customerId") Long customerId, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT COALESCE(SUM(b.finalAmount), 0.0) FROM Bill b WHERE b.customer.id = :customerId")
    Double getTotalBilledByCustomerId(@Param("customerId") Long customerId);
    
    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Bill b JOIN b.items i WHERE i.product.id = :productId AND b.billDate BETWEEN :startDate AND :endDate")
    Integer getTotalQuantitySoldForProduct(@Param("productId") Long productId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.business.id = :businessId AND b.billDate > :after")
    long countByBusinessIdAndBillDateAfter(@Param("businessId") Long businessId, @Param("after") LocalDateTime after);
}
