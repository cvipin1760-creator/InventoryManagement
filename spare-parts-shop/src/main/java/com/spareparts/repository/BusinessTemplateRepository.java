package com.spareparts.repository;

import com.spareparts.model.BusinessTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessTemplateRepository extends JpaRepository<BusinessTemplate, Long> {
}
