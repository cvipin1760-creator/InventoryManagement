package com.spareparts.repository;
import com.spareparts.model.BusinessModule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BusinessModuleRepository extends JpaRepository<BusinessModule, Long> {
    List<BusinessModule> findByBusinessId(Long businessId);
    Optional<BusinessModule> findByBusinessIdAndModuleCode(Long businessId, String moduleCode);
}
