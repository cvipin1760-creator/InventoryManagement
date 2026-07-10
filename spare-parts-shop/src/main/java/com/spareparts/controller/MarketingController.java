package com.spareparts.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/marketing")
public class MarketingController {

    @PostMapping("/whatsapp/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> sendWhatsAppMessage(@RequestBody Map<String, String> payload) {
        String customerId = payload.get("customerId");
        String message = payload.get("message");
        
        // In a real application, you would integrate with Twilio or WhatsApp Business API here.
        // e.g., Message.creator(new PhoneNumber("whatsapp:+91xxxxxxxxx"), new PhoneNumber("whatsapp:+14155238886"), message).create();
        
        System.out.println("Simulating WhatsApp Message to Customer ID " + customerId + ": " + message);
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "WhatsApp message sent successfully"));
    }

    @PostMapping("/whatsapp/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> sendBulkWhatsApp(@RequestBody Map<String, Object> payload) {
        String message = (String) payload.get("message");
        Object audience = payload.get("audience"); // "all", "active", "inactive"
        
        System.out.println("Simulating Bulk WhatsApp Message to audience " + audience + ": " + message);
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "Bulk WhatsApp messages queued successfully"));
    }

    @PostMapping("/sms/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> sendBulkSMS(@RequestBody Map<String, Object> payload) {
        String message = (String) payload.get("message");
        Object audience = payload.get("audience"); 
        
        System.out.println("Simulating Bulk SMS to audience " + audience + ": " + message);
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "Bulk SMS queued successfully"));
    }
}
