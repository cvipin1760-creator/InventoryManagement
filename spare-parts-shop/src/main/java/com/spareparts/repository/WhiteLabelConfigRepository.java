package com.spareparts.repository;

import com.spareparts.model.WhiteLabelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WhiteLabelConfigRepository extends JpaRepository<WhiteLabelConfig, Long> {
    Optional<WhiteLabelConfig> findByBusinessId(Long businessId);
}
