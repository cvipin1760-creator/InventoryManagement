package com.spareparts.repository;
import com.spareparts.model.FeatureRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeatureRequestRepository extends JpaRepository<FeatureRequest, Long> {
    List<FeatureRequest> findByBusinessId(Long businessId);
    List<FeatureRequest> findByStatus(String status);
}
