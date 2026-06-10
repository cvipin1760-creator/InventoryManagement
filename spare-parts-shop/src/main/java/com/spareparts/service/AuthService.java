package com.spareparts.service;

import com.spareparts.dto.LoginRequest;
import com.spareparts.dto.LoginResponse;
import com.spareparts.dto.RegisterRequest;
import com.spareparts.dto.VerifyOtpRequest;
import com.spareparts.model.User;
import com.spareparts.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public LoginResponse login(LoginRequest request) {
        String username = request.getUsername() != null ? request.getUsername().trim() : "";
        String password = request.getPassword() != null ? request.getPassword().trim() : "";

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // Treat null as enabled for legacy users
        if (user.getEnabled() != null && !user.getEnabled()) {
            throw new RuntimeException("Please verify your email first");
        }

        // Simple password check (no hashing). For safety in a real app,
        // you should hash and salt passwords.
        if (!password.equals(user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return new LoginResponse(user.getUsername(), user.getRole(), "Login successful");
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
        newUser.setRole("USER");
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
            user.setRole("USER");
            user.setEnabled(true);
            existing = userRepository.save(user);
        } else {
            if (existing.getEnabled() == null || !existing.getEnabled()) {
                existing.setEnabled(true);
                userRepository.save(existing);
            }
        }
        return new LoginResponse(existing.getUsername(), existing.getRole(), "Login successful");
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
        } else if (admin.getEnabled() == null) {
            admin.setEnabled(true);
        }
        // Store plain password for simplicity in this local app
        admin.setPassword("admin123");
        return userRepository.save(admin);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public void updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        userRepository.save(user);
    }

    public void updateUserStatus(Long id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(enabled);
        if (enabled) {
            user.setOtpCode(null);
            user.setOtpExpiry(null);
        }
        userRepository.save(user);
    }
}
