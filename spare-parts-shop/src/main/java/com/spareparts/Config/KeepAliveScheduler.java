
package com.spareparts.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class KeepAliveScheduler {

    private static final Logger logger = LoggerFactory.getLogger(KeepAliveScheduler.class);
    private final RestTemplate restTemplate = new RestTemplate();

    // Ping every 5 minutes (300,000 milliseconds) to prevent Render from sleeping
    @Scheduled(fixedRate = 300000)
    public void keepAlive() {
        try {
            // Ping the application's own health endpoint
            String baseUrl = System.getenv("RENDER_EXTERNAL_URL");
            if (baseUrl == null || baseUrl.isEmpty()) {
                // For local development, default to localhost
                baseUrl = "http://localhost:8080";
            }
            String healthUrl = baseUrl + "/";
            
            ResponseEntity<String> response = restTemplate.getForEntity(healthUrl, String.class);
            logger.info("Keep-alive ping successful: {} - Status: {}", healthUrl, response.getStatusCode());
        } catch (Exception e) {
            logger.warn("Keep-alive ping failed: {}", e.getMessage());
        }
    }
}
