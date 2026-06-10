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
    
    @Query("SELECT b FROM Bill b WHERE b.billDate BETWEEN :startDate AND :endDate ORDER BY b.billDate DESC")
    List<Bill> findBillsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT b FROM Bill b WHERE LOWER(b.customer.name) LIKE LOWER(CONCAT('%', :customerName, '%')) ORDER BY b.billDate DESC")
    List<Bill> findByCustomerName(@Param("customerName") String customerName);
    
    @Query("SELECT COALESCE(SUM(b.finalAmount), 0.0) FROM Bill b WHERE b.billDate BETWEEN :startDate AND :endDate")
    Double getTotalSalesBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(b) FROM Bill b WHERE b.billDate BETWEEN :startDate AND :endDate")
    Long countBillsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT DISTINCT b FROM Bill b JOIN b.items i JOIN i.product p " +
           "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.partNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY b.billDate DESC")
    List<Bill> findByProductKeyword(@Param("keyword") String keyword);

    @Query("SELECT i.product.id, i.price FROM Bill b JOIN b.items i " +
           "WHERE b.customer.id = :customerId " +
           "ORDER BY b.billDate DESC, b.id DESC, i.id DESC")
    List<Object[]> findCustomerProductPriceHistory(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(b.finalAmount), 0.0) FROM Bill b WHERE b.customer.id = :customerId")
    Double getTotalBilledByCustomerId(@Param("customerId") Long customerId);
}
