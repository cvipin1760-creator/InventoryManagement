package com.spareparts.controller;

import com.spareparts.dto.CreateUserRequest;
import com.spareparts.model.Business;
import com.spareparts.model.User;
import com.spareparts.service.AuthService;
import com.spareparts.service.BusinessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-manager")
@CrossOrigin(origins = "*")
public class SuperManagerController {

    @Autowired
    private AuthService authService;

    @Autowired
    private BusinessService businessService;

    @Autowired
    private com.spareparts.repository.UserRepository userRepository;

    @Autowired
    private com.spareparts.repository.FeaturePermissionsRepository featurePermissionsRepository;

    // ==================== Admin Management ====================
    @GetMapping("/admins")
    public List<User> getAllAdmins(java.security.Principal principal) {
        return authService.getAllUsers(principal.getName()).stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .toList();
    }

    @PostMapping("/admins")
    public User createAdmin(@RequestBody CreateUserRequest request) {
        // 1. Create and save Business
        Business business = new Business();
        business.setBusinessName(request.getBusinessName());
        business.setGstNumber(request.getGstNumber());
        business.setAddress(request.getAddress());
        business.setContactNumber(request.getContactNumber());
        business.setEmail(request.getEmail());
        business.setBusinessType(request.getBusinessType());
        business.setSubscriptionPlan(request.getSubscriptionPlan() != null ? request.getSubscriptionPlan() : "TRIAL");
        business = businessService.createBusiness(business);

        // 2. Create and save FeaturePermissions
        com.spareparts.model.FeaturePermissions fp = new com.spareparts.model.FeaturePermissions();
        fp.setBusiness(business);
        fp.setInventoryEnabled(true);
        fp.setBillingEnabled(true);
        fp.setGstEnabled(true);
        fp.setReportsEnabled(true);
        featurePermissionsRepository.save(fp);

        // 3. Create Admin User associated with the Business
        User admin = new User();
        admin.setUsername(request.getUsername());
        admin.setEmail(request.getEmail());
        admin.setPassword(request.getPassword());
        admin.setRole("ADMIN");
        admin.setEnabled(request.getEnabled() != null ? request.getEnabled() : true);
        admin.setBusiness(business);
        return userRepository.save(admin);
    }

    @PutMapping("/admins/{id}/role")
    public ResponseEntity<Map<String, Object>> updateAdminRole(@PathVariable Long id, @RequestBody Map<String, String> body, java.security.Principal principal) {
        authService.updateUserRole(id, body.get("role"), principal.getName());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admins/{id}/status")
    public ResponseEntity<Map<String, Object>> updateAdminStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body, java.security.Principal principal) {
        authService.updateUserStatus(id, body.get("enabled"), principal.getName());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<Map<String, Object>> deleteAdmin(@PathVariable Long id, java.security.Principal principal) {
        authService.deleteUser(id, principal.getName());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    // ==================== Business Management ====================
    @GetMapping("/businesses")
    public List<Business> getAllBusinesses() {
        return businessService.getAllBusinesses();
    }

    @GetMapping("/businesses/{id}")
    public Business getBusinessById(@PathVariable Long id) {
        return businessService.getBusinessById(id);
    }

    @PostMapping("/businesses")
    public Business createBusiness(@RequestBody Business business) {
        return businessService.createBusiness(business);
    }

    @PutMapping("/businesses/{id}")
    public Business updateBusiness(@PathVariable Long id, @RequestBody Business business) {
        return businessService.updateBusiness(id, business);
    }

    @DeleteMapping("/businesses/{id}")
    public ResponseEntity<Map<String, Object>> deleteBusiness(@PathVariable Long id) {
        businessService.deleteBusiness(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    // ==================== Subscription Management ====================
    @PutMapping("/businesses/{id}/subscription")
    public Business updateSubscription(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return businessService.updateSubscription(id, body.get("subscriptionPlan"));
    }

    @PutMapping("/businesses/{id}/subscription/status")
    public Business toggleSubscriptionStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return businessService.toggleSubscriptionStatus(id, body.get("isActive"));
    }

    // ==================== Feature Permissions ====================
    @GetMapping("/businesses/{id}/features")
    public com.spareparts.model.FeaturePermissions getFeaturePermissions(@PathVariable Long id) {
        return featurePermissionsRepository.findByBusinessId(id)
                .orElseThrow(() -> new RuntimeException("Feature permissions not found for business"));
    }

    @PutMapping("/businesses/{id}/features")
    public com.spareparts.model.FeaturePermissions updateFeaturePermissions(@PathVariable Long id, @RequestBody com.spareparts.model.FeaturePermissions features) {
        com.spareparts.model.FeaturePermissions existing = featurePermissionsRepository.findByBusinessId(id)
                .orElseThrow(() -> new RuntimeException("Feature permissions not found for business"));
        
        existing.setInventoryEnabled(features.getInventoryEnabled());
        existing.setBillingEnabled(features.getBillingEnabled());
        existing.setWarrantyEnabled(features.getWarrantyEnabled());
        existing.setEmiEnabled(features.getEmiEnabled());
        existing.setGstEnabled(features.getGstEnabled());
        existing.setCustomerPortalEnabled(features.getCustomerPortalEnabled());
        existing.setReportsEnabled(features.getReportsEnabled());
        existing.setWhatsappNotificationsEnabled(features.getWhatsappNotificationsEnabled());
        existing.setSmsNotificationsEnabled(features.getSmsNotificationsEnabled());
        existing.setMultiUserSupportEnabled(features.getMultiUserSupportEnabled());
        existing.setEmployeeManagementEnabled(features.getEmployeeManagementEnabled());
        existing.setMultiBranchEnabled(features.getMultiBranchEnabled());
        existing.setWebSocketsEnabled(features.getWebSocketsEnabled());
        existing.setAiAnalyticsEnabled(features.getAiAnalyticsEnabled());
        existing.setAccountingExportEnabled(features.getAccountingExportEnabled());
        existing.setMarketingEnabled(features.getMarketingEnabled());
        
        return featurePermissionsRepository.save(existing);
    }
}
