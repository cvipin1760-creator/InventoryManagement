package com.spareparts.repository;

import com.spareparts.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    @Query("SELECT s FROM Supplier s WHERE s.business.id = :businessId AND (:branchId IS NULL OR s.branch.id = :branchId)")
    List<Supplier> findByBusinessId(@Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT s FROM Supplier s WHERE s.business.id = :businessId AND (:branchId IS NULL OR s.branch.id = :branchId) AND (LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR s.phone LIKE CONCAT('%', :keyword, '%'))")
    List<Supplier> searchSuppliers(@Param("keyword") String keyword, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
    
    @Query("SELECT s FROM Supplier s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR s.phone LIKE CONCAT('%', :keyword, '%')")
    List<Supplier> searchSuppliers(@Param("keyword") String keyword);
}
