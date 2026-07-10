package com.spareparts.repository;

import com.spareparts.model.AuditTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditTaskRepository extends JpaRepository<AuditTask, Long> {
    @Query("SELECT a FROM AuditTask a WHERE a.business.id = :businessId AND (:branchId IS NULL OR a.branch.id = :branchId) ORDER BY a.createdAt DESC")
    List<AuditTask> findByBusinessIdAndBranchId(@Param("businessId") Long businessId, @Param("branchId") Long branchId);

    @Query("SELECT a FROM AuditTask a WHERE a.status = :status AND a.business.id = :businessId AND (:branchId IS NULL OR a.branch.id = :branchId) ORDER BY a.createdAt DESC")
    List<AuditTask> findByStatusAndBusinessIdAndBranchId(@Param("status") String status, @Param("businessId") Long businessId, @Param("branchId") Long branchId);
}
