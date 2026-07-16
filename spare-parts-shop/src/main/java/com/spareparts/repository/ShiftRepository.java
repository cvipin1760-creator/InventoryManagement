package com.spareparts.repository;

import com.spareparts.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    Optional<Shift> findByUserIdAndBusinessIdAndStatus(Long userId, Long businessId, String status);
    List<Shift> findByBusinessIdOrderByStartTimeDesc(Long businessId);
}
