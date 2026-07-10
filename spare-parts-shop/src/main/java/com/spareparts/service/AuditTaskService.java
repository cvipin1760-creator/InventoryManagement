package com.spareparts.service;

import com.spareparts.model.AuditTask;
import com.spareparts.model.Business;
import com.spareparts.model.Branch;
import com.spareparts.model.Product;
import com.spareparts.model.User;
import com.spareparts.repository.AuditTaskRepository;
import com.spareparts.repository.ProductRepository;
import com.spareparts.repository.UserRepository;
import com.spareparts.config.TenantContext;
import com.spareparts.config.BranchContext;
import com.spareparts.exception.TenantAccessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditTaskService {
    private final AuditTaskRepository auditTaskRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final com.spareparts.repository.BusinessRepository businessRepository;
    private final com.spareparts.repository.BranchRepository branchRepository;

    public List<AuditTask> getAllAuditTasks() {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) throw new TenantAccessException("No business context");
        return auditTaskRepository.findByBusinessIdAndBranchId(businessId, BranchContext.getBranchId());
    }

    @Transactional
    public AuditTask createAuditTask(Long productId, String username) {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) throw new TenantAccessException("No business context");
        
        Business business = businessRepository.findById(businessId).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();
        User user = userRepository.findByUsername(username).orElseThrow();
        
        AuditTask task = new AuditTask();
        task.setBusiness(business);
        if (BranchContext.getBranchId() != null) {
            Branch branch = branchRepository.findById(BranchContext.getBranchId()).orElseThrow();
            task.setBranch(branch);
        }
        
        task.setProduct(product);
        task.setAuditor(user);
        task.setExpectedQuantity(product.getQuantity());
        task.setStatus("PENDING");
        return auditTaskRepository.save(task);
    }

    @Transactional
    public AuditTask completeAuditTask(Long id, Integer actualQuantity) {
        AuditTask task = auditTaskRepository.findById(id).orElseThrow();
        com.spareparts.config.TenantSecurity.checkAccess(task);
        
        task.setActualQuantity(actualQuantity);
        task.setCompletedAt(LocalDateTime.now());
        
        if (actualQuantity.equals(task.getExpectedQuantity())) {
            task.setStatus("COMPLETED");
        } else {
            task.setStatus("DISCREPANCY");
            // Optionally, automatically correct inventory or require manual review
            Product product = task.getProduct();
            product.setQuantity(actualQuantity);
            productRepository.save(product);
        }
        return auditTaskRepository.save(task);
    }
}
