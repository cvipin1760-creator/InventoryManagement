package com.spareparts.controller;

import com.spareparts.model.Customer;
import com.spareparts.model.EMI;
import com.spareparts.model.User;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.EMIRepository;
import com.spareparts.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emis")
@CrossOrigin(origins = "*")
public class EMIController {

    @Autowired
    private EMIRepository emiRepository;

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
    public ResponseEntity<List<EMI>> getEmis(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        
        if ("CUSTOMER".equals(user.getRole())) {
            Customer customer = getCustomerForUser(user);
            return ResponseEntity.ok(emiRepository.findByCustomerId(customer.getId()));
        } else {
            return ResponseEntity.ok(emiRepository.findByBusinessId(user.getBusiness().getId()));
        }
    }
}
