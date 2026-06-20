package com.spareparts.repository;

import com.spareparts.model.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, Long> {
    List<Warranty> findByBusinessId(Long businessId);
    List<Warranty> findByCustomerId(Long customerId);
}
