package com.spareparts.service;

import com.spareparts.model.Branch;
import com.spareparts.model.Business;
import com.spareparts.repository.BranchRepository;
import com.spareparts.repository.BusinessRepository;
import com.spareparts.config.TenantContext;
import com.spareparts.config.TenantSecurity;
import com.spareparts.exception.TenantAccessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import com.spareparts.aspect.EnforceUsageLimit;
import com.spareparts.aspect.UsageLimitType;

@Service
public class BranchService {

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private com.spareparts.repository.UserRepository userRepository;

    public List<Branch> getAllBranches(String currentUsername) {
        if (currentUsername != null) {
            com.spareparts.model.User user = userRepository.findByUsername(currentUsername).orElse(null);
            if (user != null && ("SUPER_ADMIN".equals(user.getRole()) || "SUPER_MANAGER".equals(user.getRole()))) {
                return branchRepository.findAll();
            }
        }
        
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            throw new TenantAccessException("No business context found and user is not a Super Admin");
        }
        return branchRepository.findByBusinessId(businessId);
    }

    public Branch getBranchById(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
        TenantSecurity.checkAccess(branch);
        return branch;
    }

    @EnforceUsageLimit(UsageLimitType.BRANCHES)
    public Branch createBranch(Branch branch) {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            throw new TenantAccessException("No business context found");
        }
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new TenantAccessException("Business not found"));
        branch.setBusiness(business);
        return branchRepository.save(branch);
    }

    public Branch updateBranch(Long id, Branch branchDetails) {
        Branch branch = getBranchById(id);
        branch.setName(branchDetails.getName());
        branch.setAddress(branchDetails.getAddress());
        branch.setContactNumber(branchDetails.getContactNumber());
        return branchRepository.save(branch);
    }

    public void deleteBranch(Long id) {
        Branch branch = getBranchById(id);
        branchRepository.delete(branch);
    }
}
