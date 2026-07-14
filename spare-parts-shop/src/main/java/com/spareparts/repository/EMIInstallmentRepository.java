
package com.spareparts.repository;

import com.spareparts.model.EMIInstallment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Repository
public interface EMIInstallmentRepository extends JpaRepository<EMIInstallment, Long> {
    List<EMIInstallment> findByEmiId(Long emiId);
    List<EMIInstallment> findByBusinessId(Long businessId);
    List<EMIInstallment> findByCustomerId(Long customerId);

    @Query("SELECT COUNT(e) FROM EMIInstallment e WHERE e.business.id = :businessId AND e.dueDate = :today AND e.status = 'PENDING'")
    Long countTodayDue(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(e) FROM EMIInstallment e WHERE e.business.id = :businessId AND e.dueDate < :today AND e.status = 'PENDING'")
    Long countOverdue(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    @Query("SELECT SUM(e.amount) FROM EMIInstallment e WHERE e.business.id = :businessId AND e.status = 'PAID'")
    Double sumPaidAmount(@Param("businessId") Long businessId);

    @Query("SELECT SUM(e.amount) FROM EMIInstallment e WHERE e.business.id = :businessId AND e.status = 'PENDING'")
    Double sumPendingAmount(@Param("businessId") Long businessId);
}
