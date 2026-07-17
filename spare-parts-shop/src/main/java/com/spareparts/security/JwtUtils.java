package com.spareparts.security;

import com.spareparts.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Adapter bean that exposes JwtUtil under the expected class name
 * for controllers that reference com.spareparts.security.JwtUtils.
 */
@Component
public class JwtUtils {

    @Autowired
    private JwtUtil jwtUtil;

    public Long getUserIdFromToken(String token) {
        return jwtUtil.extractUserId(token);
    }

    public String getUsernameFromToken(String token) {
        return jwtUtil.extractUsername(token);
    }

    public String getRoleFromToken(String token) {
        return jwtUtil.extractRole(token);
    }

    public Long getBusinessIdFromToken(String token) {
        return jwtUtil.extractBusinessId(token);
    }

    public Long getBranchIdFromToken(String token) {
        return jwtUtil.extractBranchId(token);
    }

    public boolean validateToken(String token, String username) {
        return Boolean.TRUE.equals(jwtUtil.validateToken(token, username));
    }
}
