package com.spareparts.repository;

import com.spareparts.model.SuspendedCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SuspendedCartRepository extends JpaRepository<SuspendedCart, Long> {
    List<SuspendedCart> findByBusinessIdOrderBySuspendedAtDesc(Long businessId);
    Optional<SuspendedCart> findByIdAndBusinessId(Long id, Long businessId);
}
