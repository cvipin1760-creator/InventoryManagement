package com.spareparts.repository;

import com.spareparts.model.EMI;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EMIRepository extends JpaRepository<EMI, Long> {
    List<EMI> findByBusinessId(Long businessId);
    List<EMI> findByCustomerId(Long customerId);
}
