package com.spareparts.service;

import com.spareparts.model.Business;
import com.spareparts.model.CustomRole;
import com.spareparts.repository.BusinessRepository;
import com.spareparts.repository.CustomRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {

    @Autowired
    private CustomRoleRepository customRoleRepository;

    @Autowired
    private BusinessRepository businessRepository;

    public List<CustomRole> getRolesByBusiness(Long businessId) {
        return customRoleRepository.findByBusinessId(businessId);
    }

    public CustomRole createRole(Long businessId, CustomRole roleRequest) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));
        
        CustomRole role = new CustomRole();
        role.setName(roleRequest.getName());
        role.setColor(roleRequest.getColor());
        role.setIcon(roleRequest.getIcon());
        role.setPermissionsJson(roleRequest.getPermissionsJson());
        role.setBusiness(business);
        
        return customRoleRepository.save(role);
    }

    public CustomRole updateRole(Long id, Long businessId, CustomRole roleRequest) {
        CustomRole role = customRoleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
                
        if (!role.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        role.setName(roleRequest.getName());
        role.setColor(roleRequest.getColor());
        role.setIcon(roleRequest.getIcon());
        role.setPermissionsJson(roleRequest.getPermissionsJson());
        
        return customRoleRepository.save(role);
    }

    public void deleteRole(Long id, Long businessId) {
        CustomRole role = customRoleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
                
        if (!role.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        customRoleRepository.delete(role);
    }
}
