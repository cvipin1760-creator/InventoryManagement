package com.spareparts.repository;
import com.spareparts.model.ModuleDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ModuleDefinitionRepository extends JpaRepository<ModuleDefinition, Long> {
    Optional<ModuleDefinition> findByCode(String code);
}
