package com.spareparts.controller;

import com.spareparts.config.TenantContext;
import com.spareparts.model.Product;
import com.spareparts.model.Customer;
import com.spareparts.repository.ProductRepository;
import com.spareparts.repository.CustomerRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class GlobalSearchController {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    @GetMapping("/global")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<SearchResult>> globalSearch(@RequestParam String q) {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<SearchResult> results = new ArrayList<>();
        String query = q.toLowerCase();

        // Search Products
        List<Product> products = productRepository.findByBusinessId(businessId);
        results.addAll(products.stream()
                .filter(p -> p.getName().toLowerCase().contains(query) || p.getPartNumber().toLowerCase().contains(query))
                .map(p -> new SearchResult("Product", p.getName(), "/inventory/" + p.getId()))
                .collect(Collectors.toList()));

        // Search Customers
        List<Customer> customers = customerRepository.findByBusinessId(businessId);
        results.addAll(customers.stream()
                .filter(c -> c.getName().toLowerCase().contains(query) || c.getPhone().contains(query))
                .map(c -> new SearchResult("Customer", c.getName(), "/customers/" + c.getId()))
                .collect(Collectors.toList()));

        return ResponseEntity.ok(results);
    }

    @Data
    public static class SearchResult {
        private final String type;
        private final String title;
        private final String url;
    }
}
