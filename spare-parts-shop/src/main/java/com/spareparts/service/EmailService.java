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

    public void sendCustomerWelcomeEmail(String to, String customerId, String tempPassword) {
        // Fallback: log to console so user can see it during development
        System.out.println("----------------------------------------");
        System.out.println("Welcome Email for " + to);
        System.out.println("Customer ID: " + customerId);
        System.out.println("Temporary Password: " + tempPassword);
        System.out.println("----------------------------------------");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Welcome to Your Customer Portal");
            message.setText("Welcome! Your customer profile has been created.\n\n" +
                    "You can log in to your Customer Portal to view your invoices, EMI details, and warranty status.\n\n" +
                    "Your Login Credentials:\n" +
                    "Customer ID: " + customerId + "\n" +
                    "Password: " + tempPassword + "\n\n" +
                    "Please log in and change your password as soon as possible.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email failed to send, but credentials are visible above in logs: " + e.getMessage());
        }
    }
}
