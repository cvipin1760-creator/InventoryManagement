package com.spareparts.controller;

import com.spareparts.model.Bill;
import com.spareparts.model.Customer;
import com.spareparts.model.User;
import com.spareparts.repository.BillRepository;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer-portal")
public class CustomerPortalController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BillRepository billRepository;

    private Customer getAuthenticatedCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || !"CUSTOMER".equals(user.getRole())) {
            throw new RuntimeException("Unauthorized");
        }
        return customerRepository.findByCustomerId(user.getUsername()).orElse(null);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Customer customer = getAuthenticatedCustomer();
        if (customer == null) {
            return ResponseEntity.status(401).body("Customer not found");
        }

        List<Bill> purchases = billRepository.findByCustomerId(customer.getId());
        double totalSpent = purchases.stream().mapToDouble(Bill::getFinalAmount).sum();

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("customerName", customer.getName());
        dashboard.put("customerId", customer.getCustomerId());
        dashboard.put("totalPurchases", purchases.size());
        dashboard.put("totalSpent", totalSpent);
        dashboard.put("loyaltyPoints", customer.getLoyaltyPoints());
        dashboard.put("recentPurchases", purchases.stream().limit(5).toList());

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/purchases")
    public ResponseEntity<?> getPurchases() {
        Customer customer = getAuthenticatedCustomer();
        if (customer == null) {
            return ResponseEntity.status(401).body("Customer not found");
        }
        return ResponseEntity.ok(billRepository.findByCustomerId(customer.getId()));
    }

    @GetMapping("/purchases/{id}")
    public ResponseEntity<?> getPurchaseById(@PathVariable Long id) {
        Customer customer = getAuthenticatedCustomer();
        if (customer == null) {
            return ResponseEntity.status(401).body("Customer not found");
        }
        Bill bill = billRepository.findById(id).orElse(null);
        if (bill == null || !bill.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(404).body("Invoice not found");
        }
        return ResponseEntity.ok(bill);
    }
}
