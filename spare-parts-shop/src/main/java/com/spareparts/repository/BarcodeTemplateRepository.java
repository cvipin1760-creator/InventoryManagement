package com.spareparts.repository;

import com.spareparts.model.BarcodeTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BarcodeTemplateRepository extends JpaRepository<BarcodeTemplate, Long> {
    List<BarcodeTemplate> findByBusinessId(Long businessId);
}
