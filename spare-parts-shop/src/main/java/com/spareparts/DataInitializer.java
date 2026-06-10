package com.spareparts;

import com.spareparts.model.Customer;
import com.spareparts.model.Product;
import com.spareparts.model.Supplier;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.ProductRepository;
import com.spareparts.repository.SupplierRepository;
import com.spareparts.service.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(AuthService authService, 
                                 ProductRepository productRepository, 
                                 CustomerRepository customerRepository,
                                 SupplierRepository supplierRepository) {
        return args -> {
            // Initialize admin
            authService.createDefaultAdmin();
            System.out.println("Default admin ready (username: admin, password: admin123)");

            // Add dummy products if empty
            if (productRepository.count() == 0) {
                Product p1 = createProduct("Engine Oil 5W-30", "EO-001", 800.0, 1200.0, 18.0, 50, 10);
                Product p2 = createProduct("Brake Pads Front", "BP-F01", 500.0, 850.0, 12.0, 30, 5);
                Product p3 = createProduct("Air Filter", "AF-001", 200.0, 350.0, 5.0, 100, 20);
                Product p4 = createProduct("Oil Filter", "OF-001", 150.0, 250.0, 5.0, 80, 15);
                Product p5 = createProduct("Spark Plug", "SP-001", 80.0, 150.0, 12.0, 200, 50);
                Product p6 = createProduct("Battery 12V", "BAT-01", 3200.0, 4500.0, 28.0, 15, 3);
                Product p7 = createProduct("Headlight Bulb H7", "HL-H7", 120.0, 200.0, 12.0, 40, 10);
                Product p8 = createProduct("Wiper Blades", "WB-01", 350.0, 600.0, 12.0, 25, 5);
                Product p9 = createProduct("Clutch Plate", "CP-001", 2200.0, 3500.0, 18.0, 10, 2);
                Product p10 = createProduct("Shock Absorber Rear", "SA-R01", 1800.0, 2800.0, 18.0, 20, 5);

                productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10));
                System.out.println("Dummy products seeded.");
            }

            // Add dummy customers if empty
            if (customerRepository.count() == 0) {
                Customer c1 = new Customer(null, "Rahul Sharma", "9876543210", "New Delhi", LocalDateTime.now());
                Customer c2 = new Customer(null, "Amit Singh", "9123456789", "Mumbai", LocalDateTime.now());
                Customer c3 = new Customer(null, "Priya Patel", "8877665544", "Ahmedabad", LocalDateTime.now());
                Customer c4 = new Customer(null, "Sneha Reddy", "7766554433", "Hyderabad", LocalDateTime.now());
                Customer c5 = new Customer(null, "Vikram Malhotra", "9988776655", "Bangalore", LocalDateTime.now());

                customerRepository.saveAll(Arrays.asList(c1, c2, c3, c4, c5));
                System.out.println("Dummy customers seeded.");
            }

            // Add dummy suppliers if empty
            if (supplierRepository.count() == 0) {
                Supplier s1 = new Supplier(null, "Auto Parts Wholesale", "9898989898", "wholesale@auto.com", "Industrial Area, Delhi", LocalDateTime.now());
                Supplier s2 = new Supplier(null, "Global Spare Co.", "9797979797", "sales@globalspare.com", "Sector 18, Gurgaon", LocalDateTime.now());
                Supplier s3 = new Supplier(null, "Quality Gears Ltd.", "9696969696", "info@qualitygears.com", "Pune, Maharashtra", LocalDateTime.now());

                supplierRepository.saveAll(Arrays.asList(s1, s2, s3));
                System.out.println("Dummy suppliers seeded.");
            }
        };
    }

    private Product createProduct(String name, String partNumber, Double costPrice, Double price, Double gstPercent, Integer quantity, Integer threshold) {
        Product p = new Product();
        p.setName(name);
        p.setPartNumber(partNumber);
        p.setCostPrice(costPrice);
        p.setPrice(price);
        p.setGstPercent(gstPercent);
        p.setQuantity(quantity);
        p.setLowStockThreshold(threshold);
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        return p;
    }
}

