package com.spareparts.repository;

import com.spareparts.model.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, Long> {
    List<Warranty> findByBusinessId(Long businessId);
    List<Warranty> findByCustomerId(Long customerId);

    @Query("SELECT COUNT(w) FROM Warranty w WHERE w.business.id = :businessId AND w.warrantyEndDate BETWEEN :today AND :next30Days")
    Long countUpcomingExpiry(@Param("businessId") Long businessId, @Param("today") LocalDate today, @Param("next30Days") LocalDate next30Days);

    @Query("SELECT COUNT(w) FROM Warranty w WHERE w.business.id = :businessId AND w.warrantyEndDate < :today")
    Long countExpired(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(DISTINCT w.customer.id) FROM Warranty w WHERE w.business.id = :businessId AND w.warrantyEndDate >= :today")
    Long countActiveWarrantyCustomers(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(DISTINCT w.customer.id) FROM Warranty w WHERE w.business.id = :businessId AND w.warrantyEndDate < :today")
    Long countExpiredWarrantyCustomers(@Param("businessId") Long businessId, @Param("today") LocalDate today);
}
