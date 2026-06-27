package com.spareparts.config;

import com.spareparts.model.BelongsToBusiness;
import com.spareparts.exception.TenantAccessException;

public class TenantSecurity {
    public static void checkAccess(BelongsToBusiness record) {
        if (record == null) {
            return;
        }
        Long currentBusinessId = TenantContext.getBusinessId();
        if (currentBusinessId == null) {
            // Requester does not have a business context (e.g. SUPER_MANAGER or unauthenticated)
            // If the record is tenant-specific, SUPER_MANAGER is not allowed to read/write it.
            throw new TenantAccessException("Access denied: No business context found in request");
        }
        if (record.getBusiness() == null || !currentBusinessId.equals(record.getBusiness().getId())) {
            throw new TenantAccessException("Access denied: Record does not belong to your business");
        }
    }
}
