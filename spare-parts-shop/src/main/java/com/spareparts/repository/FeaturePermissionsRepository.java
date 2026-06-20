package com.spareparts.repository;

import com.spareparts.model.FeaturePermissions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeaturePermissionsRepository extends JpaRepository<FeaturePermissions, Long> {
    Optional<FeaturePermissions> findByBusinessId(Long businessId);
}
