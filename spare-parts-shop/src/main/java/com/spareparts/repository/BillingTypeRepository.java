package com.spareparts.repository;

import com.spareparts.model.BillingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillingTypeRepository extends JpaRepository<BillingType, Long> {
}
