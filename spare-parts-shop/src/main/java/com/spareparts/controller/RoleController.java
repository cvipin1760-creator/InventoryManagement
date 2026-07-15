package com.spareparts.controller;

import com.spareparts.config.TenantContext;
import com.spareparts.model.CustomRole;
import com.spareparts.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<CustomRole>> getRoles() {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(roleService.getRolesByBusiness(businessId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomRole> createRole(@RequestBody CustomRole roleRequest) {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(roleService.createRole(businessId, roleRequest));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomRole> updateRole(@PathVariable Long id, @RequestBody CustomRole roleRequest) {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(roleService.updateRole(id, businessId, roleRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }
        roleService.deleteRole(id, businessId);
        return ResponseEntity.ok().build();
    }
}
