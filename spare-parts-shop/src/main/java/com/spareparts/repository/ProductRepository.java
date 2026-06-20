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
    Optional<Product> findByPartNumberAndBusinessId(String partNumber, Long businessId);
    Optional<Product> findByPartNumber(String partNumber);
    
    List<Product> findByBusinessId(Long businessId);
    
    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.partNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> searchProducts(@Param("keyword") String keyword, @Param("businessId") Long businessId);
    
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.partNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);
    
    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId AND p.quantity <= p.lowStockThreshold ORDER BY p.quantity ASC")
    List<Product> findLowStockProducts(@Param("businessId") Long businessId);
    
    @Query("SELECT p FROM Product p WHERE p.quantity <= p.lowStockThreshold ORDER BY p.quantity ASC")
    List<Product> findLowStockProducts();
}
