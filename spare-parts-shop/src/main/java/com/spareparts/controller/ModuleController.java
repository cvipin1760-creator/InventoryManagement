package com.spareparts.controller;

import com.spareparts.config.TenantContext;
import com.spareparts.model.BusinessModule;
import com.spareparts.model.ModuleDefinition;
import com.spareparts.repository.BusinessModuleRepository;
import com.spareparts.repository.ModuleDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleDefinitionRepository moduleDefinitionRepository;
    private final BusinessModuleRepository businessModuleRepository;

    @GetMapping("/available")
    public ResponseEntity<List<ModuleDefinition>> getAvailableModules() {
        return ResponseEntity.ok(moduleDefinitionRepository.findAll());
    }

    @GetMapping("/installed")
    public ResponseEntity<List<BusinessModule>> getInstalledModules() {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(businessModuleRepository.findByBusinessId(businessId));
    }

    @GetMapping("/all-installed")
    public ResponseEntity<List<BusinessModule>> getAllInstalledModules() {
        // Super admin endpoint - returns all installed modules across all businesses
        return ResponseEntity.ok(businessModuleRepository.findAll());
    }
}
