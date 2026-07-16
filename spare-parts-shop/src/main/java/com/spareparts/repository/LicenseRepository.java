package com.spareparts.repository;
import com.spareparts.model.License;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LicenseRepository extends JpaRepository<License, Long> {
    Optional<License> findByLicenseKey(String licenseKey);
    Optional<License> findByBusinessId(Long businessId);
}
