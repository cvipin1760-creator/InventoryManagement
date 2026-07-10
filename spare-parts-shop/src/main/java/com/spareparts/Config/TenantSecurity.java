package com.spareparts.config;

import com.spareparts.model.BelongsToBusiness;
import com.spareparts.exception.TenantAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;

public class TenantSecurity {
    public static void checkAccess(BelongsToBusiness record) {
        if (record == null) {
            return;
        }
        Long currentBusinessId = TenantContext.getBusinessId();
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            return; // Super admins have access to all records
        }

        if (currentBusinessId == null) {
            // Requester does not have a business context and is not a SUPER_MANAGER
            throw new TenantAccessException("Access denied: No business context found in request");
        }
        if (record.getBusiness() == null || !currentBusinessId.equals(record.getBusiness().getId())) {
            throw new TenantAccessException("Access denied: Record does not belong to your business");
        }
    }
}
