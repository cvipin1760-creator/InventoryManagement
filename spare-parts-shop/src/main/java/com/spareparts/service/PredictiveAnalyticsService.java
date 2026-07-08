package com.spareparts.service;

import com.spareparts.dto.FastMovingProductDto;
import com.spareparts.dto.PredictiveAnalyticsDto;
import com.spareparts.model.Product;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PredictiveAnalyticsService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public PredictiveAnalyticsDto getPredictiveAnalytics() {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Long branchId = com.spareparts.config.BranchContext.getBranchId();

        PredictiveAnalyticsDto dto = new PredictiveAnalyticsDto();

        // 1. Dead Stock (No sales in 60 days, quantity > 0)
        LocalDateTime sixtyDaysAgo = LocalDateTime.now().minusDays(60);
        dto.setDeadStock(productRepository.findDeadStock(businessId, branchId, sixtyDaysAgo));

        // 2. Fast Moving Products (Top sold in last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Object[]> rawFastMoving = productRepository.findFastMovingProducts(businessId, branchId, thirtyDaysAgo);
        List<FastMovingProductDto> fastMoving = rawFastMoving.stream().map(row -> {
            Product product = (Product) row[0];
            Number quantity = (Number) row[1];
            return new FastMovingProductDto(product, quantity.longValue());
        }).collect(Collectors.toList());
        dto.setFastMovingProducts(fastMoving);

        // 3. Churned Customers (Has bought before, but not in last 90 days)
        LocalDateTime ninetyDaysAgo = LocalDateTime.now().minusDays(90);
        dto.setChurnedCustomers(customerRepository.findChurnedCustomers(businessId, branchId, ninetyDaysAgo));

        return dto;
    }
}
