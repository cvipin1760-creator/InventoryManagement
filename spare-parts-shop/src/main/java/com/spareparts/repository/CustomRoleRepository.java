package com.spareparts.repository;

import com.spareparts.model.CustomRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomRoleRepository extends JpaRepository<CustomRole, Long> {
    List<CustomRole> findByBusinessId(Long businessId);
}
