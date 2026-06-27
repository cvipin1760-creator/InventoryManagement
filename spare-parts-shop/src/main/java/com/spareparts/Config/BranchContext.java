package com.spareparts.config;

public class BranchContext {
    private static final ThreadLocal<Long> CURRENT_BRANCH = new ThreadLocal<>();

    public static Long getBranchId() {
        return CURRENT_BRANCH.get();
    }

    public static void setBranchId(Long branchId) {
        CURRENT_BRANCH.set(branchId);
    }

    public static void clear() {
        CURRENT_BRANCH.remove();
    }
}
