package com.spareparts.config;

public class TenantContext {
    private static final ThreadLocal<Long> currentBusinessId = new ThreadLocal<>();

    public static void setBusinessId(Long businessId) {
        currentBusinessId.set(businessId);
    }

    public static Long getBusinessId() {
        return currentBusinessId.get();
    }

    public static void clear() {
        currentBusinessId.remove();
    }
}
