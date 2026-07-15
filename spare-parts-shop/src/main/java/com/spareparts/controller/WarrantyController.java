package com.spareparts.controller;

import com.spareparts.model.Customer;
import com.spareparts.model.User;
import com.spareparts.model.Warranty;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.UserRepository;
import com.spareparts.repository.WarrantyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/warranties")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN') or hasAuthority('WARRANTY_VIEW') or hasRole('CUSTOMER')")
public class WarrantyController {

    @Autowired
    private WarrantyRepository warrantyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    private User getAuthenticatedUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Customer getCustomerForUser(User user) {
        if (!"CUSTOMER".equals(user.getRole())) {
            throw new RuntimeException("Not a customer");
        }
        List<Customer> customers = customerRepository.searchCustomers(user.getPhone(), user.getBusiness().getId(), null);
        if (customers.isEmpty()) {
            throw new RuntimeException("Customer profile not found");
        }
        return customers.get(0);
    }

    @GetMapping
    public ResponseEntity<List<Warranty>> getWarranties(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        
        if ("CUSTOMER".equals(user.getRole())) {
            Customer customer = getCustomerForUser(user);
            return ResponseEntity.ok(warrantyRepository.findByCustomerId(customer.getId()));
        } else if (user.getBusiness() != null) {
            return ResponseEntity.ok(warrantyRepository.findByBusinessId(user.getBusiness().getId()));
        } else {
            return ResponseEntity.ok(warrantyRepository.findAll());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Warranty> getWarrantyById(@PathVariable Long id, Authentication auth) {
        Warranty warranty = warrantyRepository.findById(id).orElseThrow(() -> new RuntimeException("Warranty not found"));
        User user = getAuthenticatedUser(auth);
        
        if ("CUSTOMER".equals(user.getRole())) {
            Customer customer = getCustomerForUser(user);
            if (!warranty.getCustomer().getId().equals(customer.getId())) {
                throw new RuntimeException("Unauthorized");
            }
        } else if (user.getBusiness() != null) {
            if (!warranty.getBusiness().getId().equals(user.getBusiness().getId())) {
                throw new RuntimeException("Unauthorized");
            }
        }
        return ResponseEntity.ok(warranty);
    }
}
