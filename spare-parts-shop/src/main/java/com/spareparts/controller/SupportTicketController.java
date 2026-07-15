package com.spareparts.controller;

import com.spareparts.model.Customer;
import com.spareparts.model.SupportTicket;
import com.spareparts.model.User;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.SupportTicketRepository;
import com.spareparts.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support-tickets")
@CrossOrigin(origins = "*")
public class SupportTicketController {

    @Autowired
    private SupportTicketRepository supportTicketRepository;

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
            throw new RuntimeException("Customer profile not found for phone: " + user.getPhone());
        }
        return customers.get(0);
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getTickets(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        
        if ("CUSTOMER".equals(user.getRole())) {
            Customer customer = getCustomerForUser(user);
            return ResponseEntity.ok(supportTicketRepository.findByCustomerId(customer.getId()));
        } else if (user.getBusiness() != null) {
            return ResponseEntity.ok(supportTicketRepository.findByBusinessId(user.getBusiness().getId()));
        } else {
            return ResponseEntity.ok(supportTicketRepository.findAll());
        }
    }

    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(@RequestBody Map<String, String> request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Customer customer = getCustomerForUser(user);

        SupportTicket ticket = new SupportTicket();
        ticket.setBusiness(user.getBusiness());
        ticket.setCustomer(customer);
        ticket.setSubject(request.get("subject"));
        ticket.setDescription(request.get("description"));
        ticket.setStatus("OPEN");
        
        return ResponseEntity.ok(supportTicketRepository.save(ticket));
    }
}
