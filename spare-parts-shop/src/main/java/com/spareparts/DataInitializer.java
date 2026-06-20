package com.spareparts;

import com.spareparts.model.Business;
import com.spareparts.model.Customer;
import com.spareparts.model.Product;
import com.spareparts.model.Supplier;
import com.spareparts.repository.BusinessRepository;
import com.spareparts.repository.CustomerRepository;
import com.spareparts.repository.ProductRepository;
import com.spareparts.repository.SupplierRepository;
import com.spareparts.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initDatabase(AuthService authService,
                                   ProductRepository productRepository,
                                   CustomerRepository customerRepository,
                                   SupplierRepository supplierRepository,
                                   BusinessRepository businessRepository) {
        return args -> {
            // Initialize super manager first
            authService.createDefaultSuperManager();
            logger.info("Default super manager initialized");
            // Initialize admin (which creates default business)
            authService.createDefaultAdmin();
            logger.info("Default admin initialized");

            // Get the default business
            Business defaultBusiness = businessRepository.findAll().get(0);
            logger.info("Using business: {}", defaultBusiness.getBusinessName());

            // Add dummy products if empty
            if (productRepository.count() == 0) {
                Product p1 = createProduct("Engine Oil 5W-30", "EO-001", 800.0, 1200.0, 18.0, 50, 10, defaultBusiness);
                Product p2 = createProduct("Brake Pads Front", "BP-F01", 500.0, 850.0, 12.0, 30, 5, defaultBusiness);
                Product p3 = createProduct("Air Filter", "AF-001", 200.0, 350.0, 5.0, 100, 20, defaultBusiness);
                Product p4 = createProduct("Oil Filter", "OF-001", 150.0, 250.0, 5.0, 80, 15, defaultBusiness);
                Product p5 = createProduct("Spark Plug", "SP-001", 80.0, 150.0, 12.0, 200, 50, defaultBusiness);
                Product p6 = createProduct("Battery 12V", "BAT-01", 3200.0, 4500.0, 28.0, 15, 3, defaultBusiness);
                Product p7 = createProduct("Headlight Bulb H7", "HL-H7", 120.0, 200.0, 12.0, 40, 10, defaultBusiness);
                Product p8 = createProduct("Wiper Blades", "WB-001", 350.0, 600.0, 12.0, 25, 5, defaultBusiness);
                Product p9 = createProduct("Clutch Plate", "CP-001", 2200.0, 3500.0, 18.0, 10, 2, defaultBusiness);
                Product p10 = createProduct("Shock Absorber Rear", "SA-R01", 1800.0, 2800.0, 18.0, 20, 5, defaultBusiness);

                productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10));
                logger.info("Dummy products seeded");
            }

            // Add dummy customers if empty
            if (customerRepository.count() == 0) {
                Customer c1 = createCustomer("Rahul Sharma", "9876543210", "New Delhi", defaultBusiness);
                Customer c2 = createCustomer("Amit Singh", "9123456789", "Mumbai", defaultBusiness);
                Customer c3 = createCustomer("Priya Patel", "8877665544", "Ahmedabad", defaultBusiness);
                Customer c4 = createCustomer("Sneha Reddy", "7766554433", "Hyderabad", defaultBusiness);
                Customer c5 = createCustomer("Vikram Malhotra", "9988776655", "Bangalore", defaultBusiness);

                customerRepository.saveAll(Arrays.asList(c1, c2, c3, c4, c5));
                logger.info("Dummy customers seeded");
            }

            // Add dummy suppliers if empty
            if (supplierRepository.count() == 0) {
                Supplier s1 = createSupplier("Auto Parts Wholesale", "9898989898", "wholesale@auto.com", "Industrial Area, Delhi", defaultBusiness);
                Supplier s2 = createSupplier("Global Spare Co.", "9797979797", "sales@globalspare.com", "Sector 18, Gurgaon", defaultBusiness);
                Supplier s3 = createSupplier("Quality Gears Ltd.", "9696969696", "info@qualitygears.com", "Pune, Maharashtra", defaultBusiness);

                supplierRepository.saveAll(Arrays.asList(s1, s2, s3));
                logger.info("Dummy suppliers seeded");
            }
        };
    }

    private Product createProduct(String name, String partNumber, Double costPrice, Double price, Double gstPercent, Integer quantity, Integer threshold, Business business) {
        Product p = new Product();
        p.setName(name);
        p.setPartNumber(partNumber);
        p.setCostPrice(costPrice);
        p.setPrice(price);
        p.setGstPercent(gstPercent);
        p.setQuantity(quantity);
        p.setLowStockThreshold(threshold);
        p.setBusiness(business);
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        return p;
    }

    private Customer createCustomer(String name, String phone, String address, Business business) {
        Customer c = new Customer();
        c.setName(name);
        c.setPhone(phone);
        c.setAddress(address);
        c.setBusiness(business);
        c.setCreatedAt(LocalDateTime.now());
        return c;
    }

    private Supplier createSupplier(String name, String phone, String email, String address, Business business) {
        Supplier s = new Supplier();
        s.setName(name);
        s.setPhone(phone);
        s.setEmail(email);
        s.setAddress(address);
        s.setBusiness(business);
        s.setCreatedAt(LocalDateTime.now());
        return s;
    }
}
