package com.spareparts.repository;

import com.spareparts.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByBusinessId(Long businessId);
    List<Subscription> findByStatus(String status);
}
