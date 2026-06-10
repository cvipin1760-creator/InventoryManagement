package com.spareparts.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        // Fallback: log to console so user can see it during development
        System.out.println("----------------------------------------");
        System.out.println("OTP for " + to + " is: " + otp);
        System.out.println("----------------------------------------");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Your OTP for Spare Parts Shop Registration");
            message.setText("Your verification code is: " + otp + "\nThis code will expire in 5 minutes.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email failed to send, but OTP is visible above in logs: " + e.getMessage());
        }
    }

    public String generateOtp() {
        return String.format("%06d", new Random().nextInt(1000000));
    }
}
