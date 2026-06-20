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

    // ==================== Admin Management ====================
    @GetMapping("/admins")
    public List<User> getAllAdmins() {
        return authService.getAllUsers().stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .toList();
    }

    @PostMapping("/admins")
    public User createAdmin(@RequestBody CreateUserRequest request) {
        return authService.createUser(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                "ADMIN",
                true
        );
    }

    @PutMapping("/admins/{id}/role")
    public ResponseEntity<Map<String, Object>> updateAdminRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        authService.updateUserRole(id, body.get("role"));
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admins/{id}/status")
    public ResponseEntity<Map<String, Object>> updateAdminStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        authService.updateUserStatus(id, body.get("enabled"));
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<Map<String, Object>> deleteAdmin(@PathVariable Long id) {
        authService.deleteUser(id);
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
}
