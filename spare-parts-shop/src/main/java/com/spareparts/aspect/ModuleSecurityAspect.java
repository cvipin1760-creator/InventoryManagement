package com.spareparts.aspect;

import com.spareparts.config.TenantContext;
import com.spareparts.exception.ModuleNotEnabledException;
import com.spareparts.model.BusinessModule;
import com.spareparts.repository.BusinessModuleRepository;
import com.spareparts.security.RequiresModule;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Aspect
@Component
public class ModuleSecurityAspect {

    @Autowired
    private BusinessModuleRepository businessModuleRepository;

    @Before("@annotation(requiresModule)")
    public void checkModuleAccess(JoinPoint joinPoint, RequiresModule requiresModule) {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            return; // Ignore if no tenant context (e.g. public endpoints)
        }

        String moduleCode = requiresModule.value();

        Optional<BusinessModule> opt = businessModuleRepository.findByBusinessIdAndModuleCode(businessId, moduleCode);
        if (opt.isEmpty() || !opt.get().getIsEnabled()) {
            throw new ModuleNotEnabledException(moduleCode);
        }
        
        // Also check trial expiry
        BusinessModule bm = opt.get();
        if (bm.getIsTrial() && bm.getTrialEndDate() != null && bm.getTrialEndDate().isBefore(java.time.LocalDateTime.now())) {
            throw new ModuleNotEnabledException(moduleCode + "_TRIAL_EXPIRED");
        }
    }
}
