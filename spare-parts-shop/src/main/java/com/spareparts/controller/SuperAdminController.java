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
@RequestMapping({"/api/super-admin", "/api/super-manager"})
@CrossOrigin(origins = "*")
public class SuperAdminController {

    @Autowired
    private AuthService authService;

    @Autowired
    private BusinessService businessService;

    @Autowired
    private com.spareparts.repository.UserRepository userRepository;

    @Autowired
    private com.spareparts.repository.BusinessConfigurationRepository businessConfigurationRepository;

    @Autowired
    private com.spareparts.repository.BusinessTemplateRepository businessTemplateRepository;
    
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // ==================== Admin Management ====================
    @GetMapping("/admins")
    public List<User> getAllAdmins(java.security.Principal principal) {
        return authService.getAllUsers(principal.getName()).stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .toList();
    }

    @PostMapping("/admins")
    public User createAdmin(@RequestBody CreateUserRequest request) {
        // Check if username or email already exists first
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

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

        // 2. Create and save BusinessConfiguration
        com.spareparts.model.BusinessConfiguration config = new com.spareparts.model.BusinessConfiguration();
        config.setBusiness(business);
        config.setBusinessType(request.getBusinessType() != null ? request.getBusinessType() : "Retail Store");
        config.setBillingType(request.getBillingType() != null ? request.getBillingType() : "Standard Billing");
        config.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");
        config.setTimezone(request.getTimezone() != null ? request.getTimezone() : "Asia/Kolkata");
        config.setFinancialYear(request.getFinancialYear() != null ? request.getFinancialYear() : "April-March");
        config.setModulesJson(request.getModulesJson() != null ? request.getModulesJson() : "[{\"key\":\"inventory\", \"enabled\":true}, {\"key\":\"billing\", \"enabled\":true}, {\"key\":\"emi\", \"enabled\":true}, {\"key\":\"warranty\", \"enabled\":true}, {\"key\":\"reports\", \"enabled\":true}, {\"key\":\"customers\", \"enabled\":true}, {\"key\":\"products\", \"enabled\":true}, {\"key\":\"purchases\", \"enabled\":true}, {\"key\":\"employees\", \"enabled\":true}]");
        config.setPermissionsJson(request.getPermissionsJson() != null ? request.getPermissionsJson() : "[]");
        config.setInvoiceSettingsJson(request.getInvoiceSettingsJson() != null ? request.getInvoiceSettingsJson() : "{}");
        config.setDashboardSettingsJson(request.getDashboardSettingsJson() != null ? request.getDashboardSettingsJson() : "{}");
        config.setNotificationSettingsJson(request.getNotificationSettingsJson() != null ? request.getNotificationSettingsJson() : "{}");
        config.setThemeJson(request.getThemeJson() != null ? request.getThemeJson() : "{}");
        
        businessConfigurationRepository.save(config);

        // 3. Create Admin User associated with the Business
        User admin = new User();
        admin.setUsername(request.getUsername());
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
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

    // ==================== Configuration Management ====================
    @GetMapping("/businesses/{id}/configuration")
    public com.spareparts.model.BusinessConfiguration getBusinessConfiguration(@PathVariable Long id) {
        return businessConfigurationRepository.findByBusinessId(id)
                .orElseThrow(() -> new RuntimeException("Business configuration not found"));
    }

    @PutMapping("/businesses/{id}/configuration")
    public com.spareparts.model.BusinessConfiguration updateBusinessConfiguration(@PathVariable Long id, @RequestBody com.spareparts.model.BusinessConfiguration configUpdate) {
        com.spareparts.model.BusinessConfiguration existing = businessConfigurationRepository.findByBusinessId(id)
                .orElseThrow(() -> new RuntimeException("Business configuration not found"));
        
        existing.setBusinessType(configUpdate.getBusinessType());
        existing.setBillingType(configUpdate.getBillingType());
        existing.setCurrency(configUpdate.getCurrency());
        existing.setTimezone(configUpdate.getTimezone());
        existing.setFinancialYear(configUpdate.getFinancialYear());
        existing.setModulesJson(configUpdate.getModulesJson());
        existing.setPermissionsJson(configUpdate.getPermissionsJson());
        existing.setInvoiceSettingsJson(configUpdate.getInvoiceSettingsJson());
        existing.setDashboardSettingsJson(configUpdate.getDashboardSettingsJson());
        existing.setNotificationSettingsJson(configUpdate.getNotificationSettingsJson());
        existing.setThemeJson(configUpdate.getThemeJson());
        
        return businessConfigurationRepository.save(existing);
    }
    
    // ==================== Templates ====================
    @GetMapping("/templates")
    public List<com.spareparts.model.BusinessTemplate> getBusinessTemplates() {
        return businessTemplateRepository.findAll();
    }
}
