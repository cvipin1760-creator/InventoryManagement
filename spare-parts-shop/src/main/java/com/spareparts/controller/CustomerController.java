package com.spareparts.controller;

import com.spareparts.model.Customer;
import com.spareparts.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import com.spareparts.model.User;
import com.spareparts.model.Bill;
import com.spareparts.model.Product;
import com.spareparts.repository.UserRepository;
import com.spareparts.repository.BillRepository;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BillRepository billRepository;

    private User getAuthenticatedUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Customer getCustomerForUser(User user) {
        if (!"CUSTOMER".equals(user.getRole())) {
            throw new RuntimeException("Not a customer");
        }
        List<Customer> customers = customerService.searchCustomers(user.getPhone());
        if (customers.isEmpty()) {
            throw new RuntimeException("Customer profile not found");
        }
        return customers.get(0);
    }

    
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }
    
    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.createCustomer(customer));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.updateCustomer(id, customer));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Customer>> searchCustomers(@RequestParam String keyword) {
        return ResponseEntity.ok(customerService.searchCustomers(keyword));
    }
    
    @GetMapping("/me/bills")
    public ResponseEntity<List<Bill>> getMyBills(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Customer customer = getCustomerForUser(user);
        return ResponseEntity.ok(billRepository.findByCustomerId(customer.getId()));
    }
    
    @GetMapping("/me/products")
    public ResponseEntity<List<Product>> getMyProducts(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Customer customer = getCustomerForUser(user);
        List<Bill> bills = billRepository.findByCustomerId(customer.getId());
        List<Product> products = new ArrayList<>();
        bills.forEach(bill -> {
            bill.getItems().forEach(item -> {
                if (!products.contains(item.getProduct())) {
                    products.add(item.getProduct());
                }
            });
        });
        return ResponseEntity.ok(products);
    }

    @PostMapping("/{id}/enable-b2b")
    public ResponseEntity<Void> enableB2b(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        String password = payload.get("password");
        if (password == null || password.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        customerService.enableB2bAccess(id, password);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/redeem-points")
    public ResponseEntity<java.util.Map<String, String>> redeemPoints(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Integer> payload) {
        int points = payload.get("points");
        boolean success = customerService.redeemPoints(id, points);
        if (success) {
            return ResponseEntity.ok(java.util.Map.of("message", "Points redeemed successfully"));
        } else {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Insufficient points"));
        }
    }
}