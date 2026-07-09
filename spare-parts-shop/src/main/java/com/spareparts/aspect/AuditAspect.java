package com.spareparts.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spareparts.config.TenantContext;
import com.spareparts.model.AuditLog;
import com.spareparts.model.Business;
import com.spareparts.model.BelongsToBusiness;
import com.spareparts.repository.AuditLogRepository;
import com.spareparts.repository.BusinessRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditAspect {

    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @AfterReturning(pointcut = "execution(* com.spareparts.repository.*.save(..))", returning = "result")
    public void logSave(JoinPoint joinPoint, Object result) {
        if (result == null) return;
        createAuditLog("SAVE/UPDATE", result);
    }

    @AfterReturning(pointcut = "execution(* com.spareparts.repository.*.delete(..))")
    public void logDelete(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args != null && args.length > 0 && args[0] != null) {
            createAuditLog("DELETE", args[0]);
        }
    }
    
    @AfterReturning(pointcut = "execution(* com.spareparts.repository.*.deleteById(..))")
    public void logDeleteById(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args != null && args.length > 0 && args[0] != null) {
            // Cannot easily serialize the whole object since it's deleted, but we can log the ID
            Long id = null;
            if(args[0] instanceof Long){
                 id = (Long) args[0];
            }
            if(id != null){
                createAuditLogString("DELETE_BY_ID", joinPoint.getTarget().getClass().getSimpleName(), id, "Deleted ID: " + id);
            }
        }
    }

    private void createAuditLog(String action, Object entity) {
        // Skip logging audit logs to prevent infinite loops
        if (entity instanceof AuditLog) return;

        try {
            String entityName = entity.getClass().getSimpleName();
            
            // Try to extract ID
            Long entityId = null;
            try {
                var method = entity.getClass().getMethod("getId");
                entityId = (Long) method.invoke(entity);
            } catch (Exception e) {
                // Ignore if no getId
            }
            
            if (entityId == null) entityId = 0L;

            String changes = objectMapper.writeValueAsString(entity);
            createAuditLogString(action, entityName, entityId, changes);
            
        } catch (Exception e) {
            // Silently fail for audit logging to not break business logic
            System.err.println("Failed to create audit log: " + e.getMessage());
        }
    }
    
    private void createAuditLogString(String action, String entityName, Long entityId, String changes){
        try{
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = (auth != null && auth.getName() != null) ? auth.getName() : "SYSTEM";
            
            Long businessId = TenantContext.getBusinessId();
            Business business = null;
            if (businessId != null) {
                business = businessRepository.findById(businessId).orElse(null);
            }
            
            AuditLog auditLog = new AuditLog();
            auditLog.setEntityName(entityName);
            auditLog.setEntityId(entityId);
            auditLog.setAction(action);
            auditLog.setPerformedBy(username);
            auditLog.setChanges(changes);
            auditLog.setBusiness(business);
            
            auditLogRepository.save(auditLog);
        }catch(Exception e){
             System.err.println("Failed to save audit log: " + e.getMessage());
        }
    }
}
