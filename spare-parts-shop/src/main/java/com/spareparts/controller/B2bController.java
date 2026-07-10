package com.spareparts.controller;

import com.spareparts.dto.LoginResponse;
import com.spareparts.model.Product;
import com.spareparts.service.B2bService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/b2b")
@RequiredArgsConstructor
public class B2bController {

    private final B2bService b2bService;

    @PostMapping("/{businessId}/login")
    public ResponseEntity<LoginResponse> login(@PathVariable Long businessId, @RequestBody B2bLoginRequest request) {
        try {
            return ResponseEntity.ok(b2bService.login(request.getPhone(), request.getPassword(), businessId));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new LoginResponse(null, null, null, null, null, e.getMessage()));
        }
    }

    @GetMapping("/{businessId}/products")
    @PreAuthorize("hasRole('B2B_CUSTOMER')")
    public ResponseEntity<List<Product>> getProducts(@PathVariable Long businessId) {
        return ResponseEntity.ok(b2bService.getProducts(businessId));
    }

    @Data
    public static class B2bLoginRequest {
        private String phone;
        private String password;
    }
}
