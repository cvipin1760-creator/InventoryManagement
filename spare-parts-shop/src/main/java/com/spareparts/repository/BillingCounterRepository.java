package com.spareparts.repository;

import com.spareparts.model.BillingCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingCounterRepository extends JpaRepository<BillingCounter, Long> {
    List<BillingCounter> findByBusinessId(Long businessId);
    Optional<BillingCounter> findByIdAndBusinessId(Long id, Long businessId);
    Optional<BillingCounter> findByCurrentCashierIdAndBusinessId(Long cashierId, Long businessId);
}
