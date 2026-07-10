package com.spareparts.service;

import com.spareparts.config.JwtUtil;
import com.spareparts.dto.LoginRequest;
import com.spareparts.dto.LoginResponse;
import com.spareparts.model.Customer;
import com.spareparts.model.Product;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class B2bService {
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(String phone, String password, Long businessId) {
        Customer customer = customerRepository.findByPhone(phone).stream()
                .filter(c -> c.getBusiness().getId().equals(businessId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid phone number or business ID"));

        if (!Boolean.TRUE.equals(customer.getIsB2bClient())) {
            throw new RuntimeException("B2B access is not enabled for this account");
        }

        if (customer.getPassword() == null || !passwordEncoder.matches(password, customer.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(
                customer.getId(),
                customer.getPhone(),
                "B2B_CUSTOMER",
                customer.getBusiness().getId(),
                customer.getBranch() != null ? customer.getBranch().getId() : null
        );

        LoginResponse response = new LoginResponse();
        response.setUserId(customer.getId());
        response.setUsername(customer.getPhone());
        response.setRole("B2B_CUSTOMER");
        response.setBusinessId(customer.getBusiness().getId());
        response.setBranchId(customer.getBranch() != null ? customer.getBranch().getId() : null);
        response.setToken(token);
        return response;
    }

    public List<Product> getProducts(Long businessId) {
        // Return all products for this business. 
        // In a real system, you might filter out products not intended for B2B or apply specific pricing.
        return productRepository.findByBusinessId(businessId, null, org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();
    }
}
