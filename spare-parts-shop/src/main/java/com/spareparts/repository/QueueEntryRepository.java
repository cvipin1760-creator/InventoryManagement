package com.spareparts.repository;

import com.spareparts.model.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {
    List<QueueEntry> findByBillingCounterIdAndStatusOrderByJoinTimeAsc(Long billingCounterId, String status);
    List<QueueEntry> findByBusinessIdAndStatusOrderByJoinTimeAsc(Long businessId, String status);
}
