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

@Service
public class BranchService {

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private BusinessRepository businessRepository;

    public List<Branch> getAllBranches() {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            throw new TenantAccessException("No business context found");
        }
        return branchRepository.findByBusinessId(businessId);
    }

    public Branch getBranchById(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
        TenantSecurity.checkAccess(branch);
        return branch;
    }

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
