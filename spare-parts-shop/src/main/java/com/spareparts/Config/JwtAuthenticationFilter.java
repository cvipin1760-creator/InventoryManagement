package com.spareparts.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.spareparts.repository.UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                // Token is expired, proceed unauthenticated
            } catch (Exception e) {
                // Other JWT parsing errors, proceed unauthenticated
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(jwt, username)) {
                Long businessId = jwtUtil.extractBusinessId(jwt);
                String role = jwtUtil.extractRole(jwt);
                TenantContext.setBusinessId(businessId);

                Long branchId = null;
                String branchIdHeader = request.getHeader("X-Branch-ID");
                if (branchIdHeader != null && !branchIdHeader.isEmpty()) {
                    try {
                        branchId = Long.parseLong(branchIdHeader);
                    } catch (NumberFormatException e) {
                        // ignore
                    }
                }
                if (branchId == null) {
                    branchId = jwtUtil.extractBranchId(jwt);
                }
                if (branchId != null) {
                    BranchContext.setBranchId(branchId);
                }

                java.util.List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                
                Long userId = jwtUtil.extractUserId(jwt);
                if (userId != null) {
                    com.spareparts.model.User user = userRepository.findById(userId).orElse(null);
                    if (user != null) {
                        if (user.getPermissions() != null) {
                            user.getPermissions().forEach(p -> authorities.add(new SimpleGrantedAuthority(p)));
                        }
                        if (user.getCustomRole() != null && user.getCustomRole().getPermissionsJson() != null) {
                            try {
                                java.util.List<String> rolePerms = new com.fasterxml.jackson.databind.ObjectMapper()
                                    .readValue(user.getCustomRole().getPermissionsJson(), new com.fasterxml.jackson.core.type.TypeReference<java.util.List<String>>(){});
                                rolePerms.forEach(p -> authorities.add(new SimpleGrantedAuthority(p)));
                            } catch (Exception e) {
                                // ignore
                            }
                        }
                    }
                }

                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                authorities
                        );
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }

        filterChain.doFilter(request, response);
        
        TenantContext.clear();
        BranchContext.clear();
    }
}
