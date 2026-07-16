package com.spareparts.service;

import com.spareparts.model.Customer;
import com.spareparts.model.Business;
import com.spareparts.model.Branch;
import com.spareparts.model.User;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

@Service
public class CustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private com.spareparts.repository.BusinessRepository businessRepository;

    @Autowired
    private com.spareparts.repository.BranchRepository branchRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    @Cacheable(value = "customers", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()")
    public List<Customer> getAllCustomers() {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return customerRepository.findByBusinessId(businessId, branchId);
    }
    
    public Customer getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        com.spareparts.config.TenantSecurity.checkAccess(customer);
        return customer;
    }
    
    @Caching(evict = {
        @CacheEvict(value = "customers", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()"),
        @CacheEvict(value = "dashboardStats", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()")
    })
    public Customer createCustomer(Customer customer) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Business not found"));
        customer.setBusiness(business);
        
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        if (branchId != null) {
            Branch branch = branchRepository.findById(branchId)
                    .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Branch not found"));
            customer.setBranch(branch);
        }

        customer.setCreatedAt(LocalDateTime.now());
        
        // Generate Customer ID
        String customerId = "CUST-" + (10000 + (int)(Math.random() * 90000));
        customer.setCustomerId(customerId);
        
        // Generate temporary password
        String tempPassword = String.valueOf(100000 + (int)(Math.random() * 900000));
        customer.setPassword(passwordEncoder.encode(tempPassword));

        Customer savedCustomer = customerRepository.save(customer);
        
        // Create corresponding User for Customer Portal
        User user = new User();
        user.setUsername(customerId);
        user.setEmail(customer.getEmail());
        user.setPhone(customer.getPhone());
        user.setPassword(customer.getPassword()); // already encoded
        user.setRole("CUSTOMER");
        user.setBusiness(business);
        user.setBranch(customer.getBranch());
        
        // Ensure email/phone are unique in users table, else it might throw exception.
        // If phone/email already exists, we might need to handle it.
        try {
            userRepository.save(user);
        } catch(Exception e) {
            // Log or handle duplicate phone/email in user table if needed
        }
        
        // Populate the unencrypted password so the controller can return it in the JSON response
        savedCustomer.setTempPlainPassword(tempPassword);
        
        // Send welcome email if customer provided an email address
        if (savedCustomer.getEmail() != null && !savedCustomer.getEmail().trim().isEmpty()) {
            emailService.sendCustomerWelcomeEmail(savedCustomer.getEmail(), customerId, tempPassword);
        }

        // Ideally send email/SMS with credentials here (tempPassword)
        System.out.println("Customer Portal Credentials for " + customer.getName() + " -> ID: " + customerId + ", Password: " + tempPassword);
        
        return savedCustomer;
    }
    
    @Caching(evict = {
        @CacheEvict(value = "customers", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()"),
        @CacheEvict(value = "dashboardStats", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()")
    })
    public Customer updateCustomer(Long id, Customer customerDetails) {
        Customer customer = getCustomerById(id); // Already validates tenant
        customer.setName(customerDetails.getName());
        customer.setPhone(customerDetails.getPhone());
        customer.setAddress(customerDetails.getAddress());
        return customerRepository.save(customer);
    }
    
    @Caching(evict = {
        @CacheEvict(value = "customers", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()"),
        @CacheEvict(value = "dashboardStats", key = "'' + T(com.spareparts.config.TenantContext).getBusinessId() + '-' + T(com.spareparts.config.BranchContext).getBranchId()")
    })
    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id); // Already validates tenant
        customerRepository.delete(customer);
    }
    
    public List<Customer> searchCustomers(String keyword) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return customerRepository.searchCustomers(keyword, businessId, branchId);
    }
    
    // Removed duplicate PasswordEncoder

    public void enableB2bAccess(Long customerId, String rawPassword) {
        Customer customer = getCustomerById(customerId);
        customer.setIsB2bClient(true);
        customer.setPassword(passwordEncoder.encode(rawPassword));
        customerRepository.save(customer);
    }
    
    @Transactional
    public boolean redeemPoints(Long customerId, int pointsToRedeem) {
        Customer customer = getCustomerById(customerId);
        if (customer.getLoyaltyPoints() != null && customer.getLoyaltyPoints() >= pointsToRedeem) {
            customer.setLoyaltyPoints(customer.getLoyaltyPoints() - pointsToRedeem);
            customerRepository.save(customer);
            return true;
        }
        return false;
    }
}
