package com.spareparts.service;

import com.spareparts.model.Supplier;
import com.spareparts.model.Business;
import com.spareparts.model.Branch;
import com.spareparts.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupplierService {
    
    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private com.spareparts.repository.BusinessRepository businessRepository;

    @Autowired
    private com.spareparts.repository.BranchRepository branchRepository;
    
    public List<Supplier> getAllSuppliers() {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return supplierRepository.findByBusinessId(businessId, branchId);
    }
    
    public Supplier getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        com.spareparts.config.TenantSecurity.checkAccess(supplier);
        return supplier;
    }
    
    public Supplier createSupplier(Supplier supplier) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Business not found"));
        supplier.setBusiness(business);
        
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        if (branchId != null) {
            Branch branch = branchRepository.findById(branchId)
                    .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Branch not found"));
            supplier.setBranch(branch);
        }

        supplier.setCreatedAt(LocalDateTime.now());
        return supplierRepository.save(supplier);
    }
    
    public Supplier updateSupplier(Long id, Supplier supplierDetails) {
        Supplier supplier = getSupplierById(id); // Already validates tenant
        supplier.setName(supplierDetails.getName());
        supplier.setPhone(supplierDetails.getPhone());
        supplier.setEmail(supplierDetails.getEmail());
        supplier.setAddress(supplierDetails.getAddress());
        return supplierRepository.save(supplier);
    }
    
    public void deleteSupplier(Long id) {
        Supplier supplier = getSupplierById(id); // Already validates tenant
        supplierRepository.delete(supplier);
    }
    
    public List<Supplier> searchSuppliers(String keyword) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return supplierRepository.searchSuppliers(keyword, businessId, branchId);
    }
}
