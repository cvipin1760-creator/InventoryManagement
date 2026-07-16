package com.spareparts.service;

import com.spareparts.config.JwtUtil;
import com.spareparts.dto.LoginRequest;
import com.spareparts.dto.LoginResponse;
import com.spareparts.dto.RegisterRequest;
import com.spareparts.dto.VerifyOtpRequest;
import com.spareparts.model.Business;
import com.spareparts.model.BusinessConfiguration;
import com.spareparts.model.User;
import com.spareparts.repository.BusinessRepository;
import com.spareparts.repository.BusinessConfigurationRepository;
import com.spareparts.repository.UserRepository;
import com.spareparts.aspect.EnforceUsageLimit;
import com.spareparts.aspect.UsageLimitType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BusinessRepository businessRepository;
    
    @Autowired
    private BusinessConfigurationRepository businessConfigurationRepository;

    @Autowired
    private com.spareparts.repository.CustomRoleRepository customRoleRepository;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        String username = request.getUsername() != null ? request.getUsername().trim() : "";
        String password = request.getPassword() != null ? request.getPassword().trim() : "";

        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                .orElseGet(() -> userRepository.findByPhone(username)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"))));

        // Treat null as enabled for legacy users
        if (user.getEnabled() != null && !user.getEnabled()) {
            throw new RuntimeException("Please verify your email first");
        }

        // Password check (hashing support with plaintext fallback)
        boolean isPasswordMatch = false;
        if (user.getPassword() != null && user.getPassword().startsWith("$2a$")) {
            isPasswordMatch = passwordEncoder.matches(password, user.getPassword());
        } else {
            isPasswordMatch = password.equals(user.getPassword());
        }
        
        if (!isPasswordMatch) {
            throw new RuntimeException("Invalid credentials");
        }
        
        LoginResponse.BusinessConfigurationDto configDto = null;
        if (user.getBusiness() != null) {
            BusinessConfiguration config = businessConfigurationRepository.findByBusinessId(user.getBusiness().getId()).orElse(null);
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String defaultModules = "[{\"key\":\"inventory\",\"enabled\":true},{\"key\":\"emi\",\"enabled\":true},{\"key\":\"warranty\",\"enabled\":true},{\"key\":\"accounting\",\"enabled\":true}]";
            
            if (config != null) {
                try {
                    String modulesStr = config.getModulesJson() != null ? config.getModulesJson() : defaultModules;
                    configDto = new LoginResponse.BusinessConfigurationDto(
                            config.getBusinessType(),
                            config.getBillingType(),
                            config.getCurrency(),
                            config.getTimezone(),
                            config.getFinancialYear(),
                            parseModulesSafely(mapper, modulesStr, defaultModules),
                            config.getPermissionsJson() != null ? mapper.readValue(config.getPermissionsJson(), new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>(){}) : null,
                            config.getInvoiceSettingsJson() != null ? mapper.readValue(config.getInvoiceSettingsJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>(){}) : null,
                            config.getDashboardSettingsJson() != null ? mapper.readValue(config.getDashboardSettingsJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>(){}) : null,
                            config.getNotificationSettingsJson() != null ? mapper.readValue(config.getNotificationSettingsJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>(){}) : null,
                            config.getThemeJson() != null ? mapper.readValue(config.getThemeJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>(){}) : null
                    );
                } catch (Exception e) {
                    e.printStackTrace();
                }
            } else {
                try {
                    configDto = new LoginResponse.BusinessConfigurationDto(
                            "RETAIL", "REGULAR", "INR", "Asia/Kolkata", "April-March",
                            mapper.readValue(defaultModules, new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>(){}),
                            null, null, null, null, null
                    );
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        String token = jwtUtil.generateToken(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getBusiness() != null ? user.getBusiness().getId() : null,
                user.getBranch() != null ? user.getBranch().getId() : null
        );
        LoginResponse response = new LoginResponse(user.getId(), user.getUsername(), user.getRole(), 
                user.getBusiness() != null ? user.getBusiness().getId() : null, 
                user.getBranch() != null ? user.getBranch().getId() : null,
                Boolean.FALSE.equals(user.getPasswordChanged()),
                configDto, "Login successful");
        response.setToken(token);
        
        java.util.Set<String> allPerms = new java.util.HashSet<>(user.getPermissions());
        if (user.getCustomRole() != null && user.getCustomRole().getPermissionsJson() != null) {
            try {
                java.util.List<String> rolePerms = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(user.getCustomRole().getPermissionsJson(), new com.fasterxml.jackson.core.type.TypeReference<java.util.List<String>>(){});
                allPerms.addAll(rolePerms);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        response.setPermissions(allPerms);
        
        if (user.getCustomRole() != null) {
            // we can pass custom role name to frontend if needed
        }
        return response;
    }

    public void changePassword(String username, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(newPassword);
        user.setPasswordChanged(true);
        userRepository.save(user);
    }

    public void register(RegisterRequest request) {
        User existingByUsername = userRepository.findByUsername(request.getUsername()).orElse(null);
        User existingByEmail = userRepository.findByEmail(request.getEmail()).orElse(null);

        // Conflict check: username exists
        if (existingByUsername != null) {
            // Username exists and belongs to a different email
            if (existingByEmail != null && !existingByUsername.getId().equals(existingByEmail.getId())) {
                // Both exist in different records
                if (Boolean.TRUE.equals(existingByUsername.getEnabled())) {
                    throw new RuntimeException("Username already exists");
                }
                if (Boolean.TRUE.equals(existingByEmail.getEnabled())) {
                    throw new RuntimeException("Email already in use");
                }
                // Both are unverified - delete the email record to merge it into the username record
                userRepository.delete(existingByEmail);
            } else {
                // Only username exists, or they belong to the same record
                if (Boolean.TRUE.equals(existingByUsername.getEnabled())) {
                    throw new RuntimeException("Username already exists");
                }
            }
            // Use the username record
            existingByUsername.setEmail(request.getEmail());
            existingByUsername.setPassword(request.getPassword());
            existingByUsername.setEnabled(false);
            saveAndSendOtp(existingByUsername);
            return;
        }

        // Conflict check: only email exists
        if (existingByEmail != null) {
            if (Boolean.TRUE.equals(existingByEmail.getEnabled())) {
                throw new RuntimeException("Email already in use");
            }
            // Email is unverified - allow updating the username if it doesn't exist
            existingByEmail.setUsername(request.getUsername());
            existingByEmail.setPassword(request.getPassword());
            existingByEmail.setEnabled(false);
            saveAndSendOtp(existingByEmail);
            return;
        }

        // Neither exists - create new
        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(request.getPassword());
        newUser.setRole("CUSTOMER"); // Default to customer
        newUser.setEnabled(false);
        saveAndSendOtp(newUser);
    }

    private void saveAndSendOtp(User user) {
        String otp = emailService.generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);
        
        try {
            emailService.sendOtpEmail(user.getEmail(), otp);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
        }
    }

    public void resendOtp(String email) {
        User user = userRepository.findAll().stream()
                .filter(u -> email.equals(u.getEmail()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found with this email"));

        if (Boolean.TRUE.equals(user.getEnabled())) {
            throw new RuntimeException("User is already verified");
        }

        String otp = emailService.generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByUsername(request.getEmail())
                .or(() -> userRepository.findAll().stream()
                        .filter(u -> request.getEmail().equals(u.getEmail()))
                        .findFirst())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        user.setEnabled(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    public void sendPasswordResetOtp(String email) {
        User user = userRepository.findAll().stream()
                .filter(u -> email.equals(u.getEmail()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found with this email"));

        String otp = emailService.generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findAll().stream()
                .filter(u -> email.equals(u.getEmail()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        user.setPassword(newPassword);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    public LoginResponse loginWithGoogle(String idToken) {
        GoogleTokenInfo info = verifyGoogleIdToken(idToken);
        if (info == null || info.email == null || !Boolean.TRUE.equals(info.emailVerified)) {
            throw new RuntimeException("Google token invalid");
        }
        String email = info.email;
        User existing = userRepository.findByEmail(email).orElse(null);
        if (existing == null) {
            String baseUsername = email.contains("@") ? email.substring(0, email.indexOf("@")) : email;
            String username = baseUsername;
            int i = 1;
            while (userRepository.existsByUsername(username)) {
                username = baseUsername + i;
                i++;
            }
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword("sso");
            user.setRole("CUSTOMER"); // Default to customer
            user.setEnabled(true);
            existing = userRepository.save(user);
        } else {
            if (existing.getEnabled() == null || !existing.getEnabled()) {
                existing.setEnabled(true);
                userRepository.save(existing);
            }
        }
        
        LoginResponse.BusinessConfigurationDto configDto = null;
        if (existing.getBusiness() != null) {
            BusinessConfiguration config = businessConfigurationRepository.findByBusinessId(existing.getBusiness().getId()).orElse(null);
            if (config != null) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                try {
                    configDto = new LoginResponse.BusinessConfigurationDto(
                            config.getBusinessType(),
                            config.getBillingType(),
                            config.getCurrency(),
                            config.getTimezone(),
                            config.getFinancialYear(),
                            config.getModulesJson() != null ? mapper.readValue(config.getModulesJson(), new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>(){}) : null,
                            config.getPermissionsJson() != null ? mapper.readValue(config.getPermissionsJson(), new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>(){}) : null,
                            config.getInvoiceSettingsJson() != null ? mapper.readValue(config.getInvoiceSettingsJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>(){}) : null,
                            config.getDashboardSettingsJson() != null ? mapper.readValue(config.getDashboardSettingsJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>(){}) : null,
                            config.getNotificationSettingsJson() != null ? mapper.readValue(config.getNotificationSettingsJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>(){}) : null,
                            config.getThemeJson() != null ? mapper.readValue(config.getThemeJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>(){}) : null
                    );
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        
        String token = jwtUtil.generateToken(
                existing.getId(),
                existing.getUsername(),
                existing.getRole(),
                existing.getBusiness() != null ? existing.getBusiness().getId() : null,
                existing.getBranch() != null ? existing.getBranch().getId() : null
        );
        LoginResponse response = new LoginResponse(existing.getId(), existing.getUsername(), existing.getRole(), 
                existing.getBusiness() != null ? existing.getBusiness().getId() : null, 
                existing.getBranch() != null ? existing.getBranch().getId() : null,
                Boolean.FALSE.equals(existing.getPasswordChanged()),
                configDto, "Login successful");
        response.setToken(token);
        response.setPermissions(existing.getPermissions());
        return response;
    }

    private GoogleTokenInfo verifyGoogleIdToken(String idToken) {
        try {
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            java.net.URL u = new java.net.URL(url);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) u.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            int code = conn.getResponseCode();
            if (code != 200) return null;
            java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            br.close();
            String json = sb.toString();
            GoogleTokenInfo info = new GoogleTokenInfo();
            info.email = extractJsonString(json, "email");
            String ev = extractJsonString(json, "email_verified");
            info.emailVerified = "true".equalsIgnoreCase(ev);
            info.name = extractJsonString(json, "name");
            return info;
        } catch (Exception e) {
            return null;
        }
    }

    private String extractJsonString(String json, String key) {
        String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) return m.group(1);
        return null;
    }

    private static class GoogleTokenInfo {
        String email;
        Boolean emailVerified;
        String name;
    }

    public User createDefaultAdmin() {
        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setUsername("admin");
            admin.setRole("ADMIN");
            admin.setEnabled(true);
            
            // Create default business
            Business business = new Business();
            business.setBusinessName("Default Business");
            business.setContactNumber("1234567890");
            business = businessRepository.save(business);
            
            // Create default BusinessConfiguration
            BusinessConfiguration config = new BusinessConfiguration();
            config.setBusiness(business);
            config.setBusinessType("Retail Store");
            config.setBillingType("Standard Billing");
            String defaultModules = "[{\"key\":\"inventory\", \"enabled\":true}, {\"key\":\"billing\", \"enabled\":true}]";
            config.setModulesJson(defaultModules);
            businessConfigurationRepository.save(config);
            
            admin.setBusiness(business);
        } else if (admin.getEnabled() == null) {
            admin.setEnabled(true);
        }
        // Store plain password for simplicity in this local app
        admin.setPassword("admin123");
        return userRepository.save(admin);
    }

    public User createDefaultSuperManager() {
        User superManager = userRepository.findByUsername("superadmin").orElse(null);
        if (superManager == null) {
            superManager = new User();
            superManager.setUsername("superadmin");
            superManager.setRole("SUPER_MANAGER");
            superManager.setEnabled(true);
            superManager.setPasswordChanged(true);
            // No business for SUPER_MANAGER
        } else if (superManager.getEnabled() == null) {
            superManager.setEnabled(true);
        }
        superManager.setPassword("superadmin123");
        return userRepository.save(superManager);
    }

    public List<User> getAllUsers(String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        if (currentUser == null) return java.util.Collections.emptyList();
        
        List<User> all = userRepository.findAll();
        if ("SUPER_ADMIN".equals(currentUser.getRole()) || "SUPER_MANAGER".equals(currentUser.getRole())) {
            return all;
        } else if ("ADMIN".equals(currentUser.getRole())) {
            return all.stream().filter(u -> currentUser.getId().equals(u.getCreatedBy()) || currentUser.getId().equals(u.getId())).toList();
        } else {
            return java.util.List.of(currentUser);
        }
    }

    public void deleteUser(Long id, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow(() -> new RuntimeException("Current user not found"));
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!"SUPER_ADMIN".equals(currentUser.getRole()) && !"SUPER_MANAGER".equals(currentUser.getRole())) {
            if ("ADMIN".equals(currentUser.getRole()) && !currentUser.getId().equals(user.getCreatedBy())) {
                throw new RuntimeException("Unauthorized to delete this user");
            }
            if ("STAFF".equals(currentUser.getRole())) {
                throw new RuntimeException("Staff cannot delete users");
            }
        }
        userRepository.deleteById(id);
    }

    public void updateUserRole(Long id, String role, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow(() -> new RuntimeException("Current user not found"));
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!"SUPER_ADMIN".equals(currentUser.getRole()) && !"SUPER_MANAGER".equals(currentUser.getRole())) {
            throw new RuntimeException("Only Super Admin can change roles");
        }
        user.setRole(role);
        userRepository.save(user);
    }

    public void updateUserStatus(Long id, boolean enabled, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow(() -> new RuntimeException("Current user not found"));
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!"SUPER_ADMIN".equals(currentUser.getRole()) && !"SUPER_MANAGER".equals(currentUser.getRole())) {
            if ("ADMIN".equals(currentUser.getRole()) && !currentUser.getId().equals(user.getCreatedBy())) {
                throw new RuntimeException("Unauthorized to update status of this user");
            }
            if ("STAFF".equals(currentUser.getRole())) {
                throw new RuntimeException("Staff cannot update user statuses");
            }
        }
        user.setEnabled(enabled);
        if (enabled) {
            user.setOtpCode(null);
            user.setOtpExpiry(null);
        }
        userRepository.save(user);
    }

    public void updateUser(Long id, com.spareparts.dto.CreateUserRequest request, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow(() -> new RuntimeException("Current user not found"));
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        // RBAC Check
        if (!"SUPER_ADMIN".equals(currentUser.getRole()) && !"SUPER_MANAGER".equals(currentUser.getRole())) {
            if ("ADMIN".equals(currentUser.getRole()) && !currentUser.getId().equals(user.getCreatedBy()) && !currentUser.getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized to update this user");
            }
            if ("STAFF".equals(currentUser.getRole()) && !currentUser.getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized to update this user");
            }
        }
        
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setRole(request.getRole());
        user.setEnabled(request.getEnabled() != null ? request.getEnabled() : true);
        
        if (request.getPermissions() != null) {
            java.util.Set<String> perms = new java.util.HashSet<>();
            request.getPermissions().forEach((k, v) -> {
                if (Boolean.TRUE.equals(v)) perms.add(k);
            });
            user.setPermissions(perms);
        }

        if (request.getCustomRoleId() != null) {
            com.spareparts.model.CustomRole role = customRoleRepository.findById(request.getCustomRoleId()).orElse(null);
            user.setCustomRole(role);
        } else {
            user.setCustomRole(null);
        }

        userRepository.save(user);
    }

    @EnforceUsageLimit(UsageLimitType.USERS)
    public User createUser(com.spareparts.dto.CreateUserRequest request, String creatorUsername) {
        User creator = userRepository.findByUsername(creatorUsername).orElse(null);
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        if (creator != null && !"SUPER_ADMIN".equals(creator.getRole())) {
            if ("SUPER_ADMIN".equals(request.getRole()) || "ADMIN".equals(request.getRole())) {
                throw new RuntimeException("Only Super Admin can create Admin or Super Admin users");
            }
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole()); // SUPER_ADMIN, ADMIN, EMPLOYEE
        user.setEnabled(request.getEnabled() != null ? request.getEnabled() : true);
        user.setPasswordChanged(false);
        if (creator != null) {
            user.setCreatedBy(creator.getId());
            user.setBusiness(creator.getBusiness());
            user.setBranch(creator.getBranch());
        }

        if (request.getPermissions() != null) {
            java.util.Set<String> perms = new java.util.HashSet<>();
            request.getPermissions().forEach((k, v) -> {
                if (Boolean.TRUE.equals(v)) perms.add(k);
            });
            user.setPermissions(perms);
        }

        if (request.getCustomRoleId() != null) {
            com.spareparts.model.CustomRole customRole = customRoleRepository.findById(request.getCustomRoleId()).orElse(null);
            user.setCustomRole(customRole);
        }

        return userRepository.save(user);
    }
    
    private java.util.List<java.util.Map<String, Object>> parseModulesSafely(com.fasterxml.jackson.databind.ObjectMapper mapper, String modulesStr, String defaultModules) {
        try {
            if (modulesStr == null || modulesStr.trim().isEmpty()) {
                return mapper.readValue(defaultModules, new com.fasterxml.jackson.core.type.TypeReference<java.util.List<java.util.Map<String, Object>>>(){});
            }
            return mapper.readValue(modulesStr, new com.fasterxml.jackson.core.type.TypeReference<java.util.List<java.util.Map<String, Object>>>(){});
        } catch (Exception e) {
            System.err.println("Error parsing modules json: " + modulesStr);
            try {
                return mapper.readValue(defaultModules, new com.fasterxml.jackson.core.type.TypeReference<java.util.List<java.util.Map<String, Object>>>(){});
            } catch (Exception ex) {
                return new java.util.ArrayList<>();
            }
        }
    }
}
