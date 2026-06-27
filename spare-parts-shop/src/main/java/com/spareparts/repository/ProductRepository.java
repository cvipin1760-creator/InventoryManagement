package com.spareparts.repository;

import com.spareparts.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p WHERE p.partNumber = :partNumber AND p.business.id = :businessId AND (:branchId IS NULL OR p.branch.id = :branchId)")
    Optional<Product> findByPartNumberAndBusinessId(@Param("partNumber") String partNumber, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    Optional<Product> findByPartNumber(String partNumber);
    
    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId AND (:branchId IS NULL OR p.branch.id = :branchId)")
    List<Product> findByBusinessId(@Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.business.id = :businessId AND (:branchId IS NULL OR p.branch.id = :branchId)")
    long countByBusinessId(@Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId AND (:branchId IS NULL OR p.branch.id = :branchId) AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.partNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> searchProducts(@Param("keyword") String keyword, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.partNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);
    
    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId AND (:branchId IS NULL OR p.branch.id = :branchId) AND p.quantity <= p.lowStockThreshold ORDER BY p.quantity ASC")
    List<Product> findLowStockProducts(@Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT p FROM Product p WHERE p.quantity <= p.lowStockThreshold ORDER BY p.quantity ASC")
    List<Product> findLowStockProducts();
}
