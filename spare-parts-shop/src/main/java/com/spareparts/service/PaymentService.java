package com.spareparts.service;

import com.spareparts.dto.CustomerBalance;
import com.spareparts.dto.PaymentRequest;
import com.spareparts.model.Bill;
import com.spareparts.model.Customer;
import com.spareparts.model.Payment;
import com.spareparts.repository.BillRepository;
import com.spareparts.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private CustomerService customerService;

    public List<Payment> getCustomerPayments(Long customerId) {
        customerService.getCustomerById(customerId);
        return paymentRepository.findByCustomerIdOrderByPaymentDateDesc(customerId);
    }

    public CustomerBalance getCustomerBalance(Long customerId) {
        customerService.getCustomerById(customerId);
        Double totalBilled = billRepository.getTotalBilledByCustomerId(customerId);
        Double totalPaid = paymentRepository.getTotalPaidByCustomerId(customerId);
        return new CustomerBalance(customerId, totalBilled, totalPaid, totalBilled - totalPaid);
    }

    @Transactional
    public Payment createPayment(PaymentRequest request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }

        Customer customer = customerService.getCustomerById(request.getCustomerId());
        Bill bill = null;
        if (request.getBillId() != null) {
            bill = billRepository.findById(request.getBillId())
                    .orElseThrow(() -> new RuntimeException("Bill not found with id: " + request.getBillId()));
            if (!bill.getCustomer().getId().equals(customer.getId())) {
                throw new RuntimeException("Selected bill does not belong to this customer");
            }
        }

        Payment payment = new Payment();
        payment.setCustomer(customer);
        payment.setBill(bill);
        payment.setAmount(request.getAmount());
        payment.setNote(request.getNote());
        payment.setPaymentDate(LocalDateTime.now());
        return paymentRepository.save(payment);
    }
}
