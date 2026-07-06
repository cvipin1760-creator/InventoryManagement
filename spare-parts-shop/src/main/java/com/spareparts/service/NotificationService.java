package com.spareparts.service;

import com.spareparts.model.Notification;
import com.spareparts.model.User;
import com.spareparts.repository.NotificationRepository;
import com.spareparts.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUserUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    public Long getUserUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public Notification markAsRead(Long id, User user) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification != null && notification.getUser().getId().equals(user.getId())) {
            notification.setIsRead(true);
            return notificationRepository.save(notification);
        }
        return null;
    }

    public void sendNotificationToUser(User sender, User recipient, String title, String message) {
        Notification notification = new Notification();
        notification.setSender(sender);
        notification.setUser(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notificationRepository.save(notification);
    }

    public void sendNotificationToAllUsers(User sender, String title, String message) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (!user.getId().equals(sender.getId())) {
                sendNotificationToUser(sender, user, title, message);
            }
        }
    }

    public void sendNotificationToUsers(User sender, List<Long> userIds, String title, String message) {
        List<User> users = userRepository.findAllById(userIds);
        for (User user : users) {
            sendNotificationToUser(sender, user, title, message);
        }
    }
}
