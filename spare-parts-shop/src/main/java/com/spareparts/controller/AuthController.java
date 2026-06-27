package com.spareparts.controller;

import com.spareparts.dto.LoginRequest;
import com.spareparts.dto.LoginResponse;
import com.spareparts.dto.RegisterRequest;
import com.spareparts.dto.VerifyOtpRequest;
import com.spareparts.model.User;
import com.spareparts.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(new LoginResponse(null, null, null, null, null, e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            return ResponseEntity.ok("OTP sent to your email");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequest request) {
        try {
            authService.verifyOtp(request);
            return ResponseEntity.ok("Verification successful, you can now login");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestParam String email) {
        try {
            authService.resendOtp(email);
            return ResponseEntity.ok("New OTP sent to your email");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/init-admin")
    public ResponseEntity<String> initAdmin() {
        authService.createDefaultAdmin();
        return ResponseEntity.ok("Default admin created (username: admin, password: admin123)");
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<String> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        try {
            authService.updateUserRole(id, role);
            return ResponseEntity.ok("User role updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<String> updateUserStatus(@PathVariable Long id, @RequestParam boolean enabled) {
        try {
            authService.updateUserStatus(id, enabled);
            return ResponseEntity.ok("User status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody com.spareparts.dto.CreateUserRequest request) {
        try {
            authService.updateUser(id, request);
            return ResponseEntity.ok("User updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        try {
            authService.sendPasswordResetOtp(email);
            return ResponseEntity.ok("Password reset OTP sent to your email");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody com.spareparts.dto.PasswordResetRequest request) {
        try {
            authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
            return ResponseEntity.ok("Password reset successful");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/sso/google")
    public ResponseEntity<LoginResponse> ssoGoogle(@RequestBody com.spareparts.dto.SsoRequest request) {
        try {
            LoginResponse response = authService.loginWithGoogle(request.getIdToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new LoginResponse(null, null, null, null, null, e.getMessage()));
        }
    }

    @PostMapping("/users")
    public ResponseEntity<String> createUser(@RequestBody com.spareparts.dto.CreateUserRequest request) {
        try {
            authService.createUser(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getRole(),
                    request.getEnabled()
            );
            return ResponseEntity.ok("User created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody com.spareparts.dto.ChangePasswordRequest request,
            java.security.Principal principal
    ) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            authService.changePassword(principal.getName(), request.getNewPassword());
            return ResponseEntity.ok("Password changed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
