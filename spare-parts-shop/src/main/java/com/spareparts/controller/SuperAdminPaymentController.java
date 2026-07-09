package com.spareparts.controller;

import com.spareparts.model.BankAccount;
import com.spareparts.model.PaymentGateway;
import com.spareparts.model.PaymentTransaction;
import com.spareparts.repository.BankAccountRepository;
import com.spareparts.repository.PaymentGatewayRepository;
import com.spareparts.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
public class SuperAdminPaymentController {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentGatewayRepository paymentGatewayRepository;
    private final BankAccountRepository bankAccountRepository;

    @GetMapping("/transactions")
    public ResponseEntity<List<PaymentTransaction>> getAllTransactions() {
        return ResponseEntity.ok(paymentTransactionRepository.findAll());
    }

    @GetMapping("/gateways")
    public ResponseEntity<List<PaymentGateway>> getGateways() {
        return ResponseEntity.ok(paymentGatewayRepository.findAll());
    }

    @PostMapping("/gateways")
    public ResponseEntity<PaymentGateway> saveGateway(@RequestBody PaymentGateway gateway) {
        return ResponseEntity.ok(paymentGatewayRepository.save(gateway));
    }

    @GetMapping("/bank-accounts")
    public ResponseEntity<List<BankAccount>> getBankAccounts() {
        return ResponseEntity.ok(bankAccountRepository.findAll());
    }

    @PostMapping("/bank-accounts")
    public ResponseEntity<BankAccount> saveBankAccount(@RequestBody BankAccount account) {
        return ResponseEntity.ok(bankAccountRepository.save(account));
    }
}
