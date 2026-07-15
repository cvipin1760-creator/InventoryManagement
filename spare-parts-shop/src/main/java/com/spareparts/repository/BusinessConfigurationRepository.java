package com.spareparts.repository;

import com.spareparts.model.BusinessConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessConfigurationRepository extends JpaRepository<BusinessConfiguration, Long> {
    Optional<BusinessConfiguration> findByBusinessId(Long businessId);
}
