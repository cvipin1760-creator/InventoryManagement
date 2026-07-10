package com.spareparts.service;

import com.spareparts.model.Product;
import com.spareparts.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShopifySyncService {

    private final ProductRepository productRepository;

    // Cron job to run every hour at minute 0
    @Scheduled(cron = "0 0 * * * *")
    public void syncInventoryToShopify() {
        log.info("Starting Shopify/WooCommerce inventory sync: {}", LocalDateTime.now());
        
        // In a real application, we would query products whose updated_at > lastSyncTime
        // and push the new stock levels to the Shopify/WooCommerce REST API.
        
        // Mock implementation: just logging for demo purposes
        List<Product> productsToSync = productRepository.findAll();
        int syncCount = 0;
        
        for (Product product : productsToSync) {
            // Mock API call to external e-commerce platform
            // shopifyApiClient.updateInventoryLevel(product.getPartNumber(), product.getQuantity());
            syncCount++;
        }
        
        log.info("Successfully synced {} products to external e-commerce platforms.", syncCount);
    }
}
