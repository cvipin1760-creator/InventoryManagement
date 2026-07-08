package com.spareparts.service;

import com.spareparts.model.Customer;
import com.spareparts.model.Business;
import com.spareparts.model.Branch;
import com.spareparts.repository.CustomerRepository;
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
    
    @Cacheable(value = "customers", key = "T(java.lang.String).valueOf(T(com.spareparts.config.TenantContext).getBusinessId()) + '-' + T(java.lang.String).valueOf(T(com.spareparts.config.BranchContext).getBranchId())")
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
        @CacheEvict(value = "customers", key = "T(java.lang.String).valueOf(T(com.spareparts.config.TenantContext).getBusinessId()) + '-' + T(java.lang.String).valueOf(T(com.spareparts.config.BranchContext).getBranchId())"),
        @CacheEvict(value = "dashboardStats", key = "T(java.lang.String).valueOf(T(com.spareparts.config.TenantContext).getBusinessId()) + '-' + T(java.lang.String).valueOf(T(com.spareparts.config.BranchContext).getBranchId())")
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
        return customerRepository.save(customer);
    }
    
    @Caching(evict = {
        @CacheEvict(value = "customers", key = "T(java.lang.String).valueOf(T(com.spareparts.config.TenantContext).getBusinessId()) + '-' + T(java.lang.String).valueOf(T(com.spareparts.config.BranchContext).getBranchId())"),
        @CacheEvict(value = "dashboardStats", key = "T(java.lang.String).valueOf(T(com.spareparts.config.TenantContext).getBusinessId()) + '-' + T(java.lang.String).valueOf(T(com.spareparts.config.BranchContext).getBranchId())")
    })
    public Customer updateCustomer(Long id, Customer customerDetails) {
        Customer customer = getCustomerById(id); // Already validates tenant
        customer.setName(customerDetails.getName());
        customer.setPhone(customerDetails.getPhone());
        customer.setAddress(customerDetails.getAddress());
        return customerRepository.save(customer);
    }
    
    @Caching(evict = {
        @CacheEvict(value = "customers", key = "T(java.lang.String).valueOf(T(com.spareparts.config.TenantContext).getBusinessId()) + '-' + T(java.lang.String).valueOf(T(com.spareparts.config.BranchContext).getBranchId())"),
        @CacheEvict(value = "dashboardStats", key = "T(java.lang.String).valueOf(T(com.spareparts.config.TenantContext).getBusinessId()) + '-' + T(java.lang.String).valueOf(T(com.spareparts.config.BranchContext).getBranchId())")
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
}