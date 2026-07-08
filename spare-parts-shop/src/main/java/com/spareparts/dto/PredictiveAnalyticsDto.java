package com.spareparts.dto;

import lombok.Data;
import java.util.List;
import com.spareparts.model.Product;
import com.spareparts.model.Customer;

@Data
public class PredictiveAnalyticsDto {
    private List<Product> deadStock; // Products not sold in 60 days with stock > 0
    private List<FastMovingProductDto> fastMovingProducts; // Top selling products in 30 days
    private List<Customer> churnedCustomers; // Customers who bought before but not in 90 days
}
