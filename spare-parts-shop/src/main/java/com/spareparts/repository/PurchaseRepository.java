package com.spareparts.repository;

import com.spareparts.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByBusinessId(Long businessId);
    
    @Query("SELECT p FROM Purchase p WHERE p.business.id = :businessId AND p.purchaseDate BETWEEN :startDate AND :endDate ORDER BY p.purchaseDate DESC")
    List<Purchase> findPurchasesBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("businessId") Long businessId);
    
    @Query("SELECT p FROM Purchase p WHERE p.purchaseDate BETWEEN :startDate AND :endDate ORDER BY p.purchaseDate DESC")
    List<Purchase> findPurchasesBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT p FROM Purchase p WHERE p.business.id = :businessId AND LOWER(p.supplier.name) LIKE LOWER(CONCAT('%', :supplierName, '%')) ORDER BY p.purchaseDate DESC")
    List<Purchase> findBySupplierName(@Param("supplierName") String supplierName, @Param("businessId") Long businessId);
    
    @Query("SELECT p FROM Purchase p WHERE LOWER(p.supplier.name) LIKE LOWER(CONCAT('%', :supplierName, '%')) ORDER BY p.purchaseDate DESC")
    List<Purchase> findBySupplierName(@Param("supplierName") String supplierName);
    
    @Query("SELECT p FROM Purchase p JOIN p.items i WHERE p.business.id = :businessId AND (LOWER(i.product.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(i.product.partNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.purchaseDate DESC")
    List<Purchase> findByProductKeyword(@Param("keyword") String keyword, @Param("businessId") Long businessId);
    
    @Query("SELECT p FROM Purchase p JOIN p.items i WHERE LOWER(i.product.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(i.product.partNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY p.purchaseDate DESC")
    List<Purchase> findByProductKeyword(@Param("keyword") String keyword);
}
