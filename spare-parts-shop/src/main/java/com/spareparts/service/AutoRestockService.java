package com.spareparts.service;

import com.spareparts.model.Notification;
import com.spareparts.model.Product;
import com.spareparts.model.User;
import com.spareparts.repository.NotificationRepository;
import com.spareparts.repository.ProductRepository;
import com.spareparts.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AutoRestockService {

    private static final Logger logger = LoggerFactory.getLogger(AutoRestockService.class);

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // Run every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * ?")
    public void checkAndNotifyLowStock() {
        logger.info("Running Auto-Restock check for low stock products...");

        List<Product> lowStockProducts = productRepository.findLowStockProducts();

        for (Product product : lowStockProducts) {
            if (shouldNotify(product)) {
                notifyAdmins(product);
                
                // Update the last notified date
                product.setLastRestockNotificationDate(LocalDateTime.now());
                productRepository.save(product);
            }
        }
        
        logger.info("Auto-Restock check completed.");
    }

    private boolean shouldNotify(Product product) {
        if (product.getLastRestockNotificationDate() == null) {
            return true;
        }
        // Only notify once every 3 days for a specific product
        return product.getLastRestockNotificationDate().isBefore(LocalDateTime.now().minusDays(3));
    }

    private void notifyAdmins(Product product) {
        // Find ADMINs for this product's business
        List<User> admins = userRepository.findByBusinessIdAndRole(product.getBusiness().getId(), "ADMIN");
        
        if (admins == null || admins.isEmpty()) {
            return;
        }

        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setTitle("Auto-Restock Alert: " + product.getName());
            notification.setMessage(String.format("Product '%s' (Part: %s) is running low on stock. Current quantity: %d. Threshold: %d. Please contact your supplier.",
                    product.getName(),
                    product.getPartNumber(),
                    product.getQuantity(),
                    product.getLowStockThreshold()));
            notification.setUser(admin);
            // System notification, no specific sender
            notification.setSender(admin); 
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            
            notificationRepository.save(notification);
            
            // TODO: Here we could also integrate an EmailService to send an actual email to the supplier!
            logger.info("Generated low stock notification for Admin ID {} regarding Product ID {}", admin.getId(), product.getId());
        }
    }
}
