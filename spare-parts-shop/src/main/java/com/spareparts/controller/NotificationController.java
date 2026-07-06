package com.spareparts.controller;

import com.spareparts.model.Notification;
import com.spareparts.model.User;
import com.spareparts.repository.UserRepository;
import com.spareparts.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(notificationService.getUserNotifications(user));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUserUnreadNotifications(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(notificationService.getUserUnreadNotifications(user));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUserUnreadCount(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(notificationService.getUserUnreadCount(user));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        Notification notification = notificationService.markAsRead(id, user);
        return notification != null ? ResponseEntity.ok(notification) : ResponseEntity.notFound().build();
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(Principal principal, @RequestBody Map<String, Object> payload) {
        if (principal == null) return ResponseEntity.status(401).build();
        User sender = userRepository.findByUsername(principal.getName()).orElse(null);
        if (sender == null || !"SUPER_MANAGER".equals(sender.getRole())) {
            return ResponseEntity.status(403).body("Only super manager can send notifications");
        }

        String title = (String) payload.get("title");
        String message = (String) payload.get("message");
        Boolean sendToAll = (Boolean) payload.getOrDefault("sendToAll", false);
        @SuppressWarnings("unchecked")
        List<Long> userIds = (List<Long>) payload.get("userIds");

        if (title == null || message == null) {
            return ResponseEntity.badRequest().body("Title and message are required");
        }

        if (Boolean.TRUE.equals(sendToAll)) {
            notificationService.sendNotificationToAllUsers(sender, title, message);
        } else if (userIds != null && !userIds.isEmpty()) {
            notificationService.sendNotificationToUsers(sender, userIds, title, message);
        } else {
            return ResponseEntity.badRequest().body("Either sendToAll must be true or userIds must be provided");
        }

        return ResponseEntity.ok("Notifications sent successfully");
    }
}
