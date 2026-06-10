package com.spareparts.controller;

import com.spareparts.dto.CustomerBalance;
import com.spareparts.dto.PaymentRequest;
import com.spareparts.model.Payment;
import com.spareparts.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Payment>> getCustomerPayments(@PathVariable Long customerId) {
        return ResponseEntity.ok(paymentService.getCustomerPayments(customerId));
    }

    @GetMapping("/customer/{customerId}/balance")
    public ResponseEntity<CustomerBalance> getCustomerBalance(@PathVariable Long customerId) {
        return ResponseEntity.ok(paymentService.getCustomerBalance(customerId));
    }

    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }
}
