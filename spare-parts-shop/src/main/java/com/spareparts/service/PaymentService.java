package com.spareparts.service;

import com.spareparts.dto.CustomerBalance;
import com.spareparts.dto.PaymentRequest;
import com.spareparts.model.Bill;
import com.spareparts.model.Customer;
import com.spareparts.model.Payment;
import com.spareparts.model.Business;
import com.spareparts.model.Branch;
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

    @Autowired
    private com.spareparts.repository.BusinessRepository businessRepository;

    @Autowired
    private com.spareparts.repository.BranchRepository branchRepository;

    public List<Payment> getCustomerPayments(Long customerId) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        customerService.getCustomerById(customerId); // Already checks tenant
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        return paymentRepository.findByCustomerIdAndBusinessIdOrderByPaymentDateDesc(customerId, businessId, branchId);
    }

    public CustomerBalance getCustomerBalance(Long customerId) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        customerService.getCustomerById(customerId); // Already checks tenant
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        Double totalBilled = billRepository.getTotalBilledByCustomerId(customerId, businessId, branchId);
        Double totalPaid = paymentRepository.getTotalPaidByCustomerId(customerId, businessId, branchId);
        return new CustomerBalance(customerId, totalBilled, totalPaid, totalBilled - totalPaid);
    }

    @Transactional
    public Payment createPayment(PaymentRequest request) {
        Long businessId = com.spareparts.config.TenantContext.getBusinessId();
        if (businessId == null) {
            throw new com.spareparts.exception.TenantAccessException("No business context found");
        }
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Business not found"));

        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }

        Customer customer = customerService.getCustomerById(request.getCustomerId()); // Already checks tenant
        Bill bill = null;
        if (request.getBillId() != null) {
            bill = billRepository.findById(request.getBillId())
                    .orElseThrow(() -> new RuntimeException("Bill not found with id: " + request.getBillId()));
            com.spareparts.config.TenantSecurity.checkAccess(bill); // Validates tenant access
            if (!bill.getCustomer().getId().equals(customer.getId())) {
                throw new RuntimeException("Selected bill does not belong to this customer");
            }
        }

        Payment payment = new Payment();
        payment.setBusiness(business);
        
        Long branchId = com.spareparts.config.BranchContext.getBranchId();
        if (branchId != null) {
            Branch branch = branchRepository.findById(branchId)
                    .orElseThrow(() -> new com.spareparts.exception.TenantAccessException("Branch not found"));
            payment.setBranch(branch);
        } else if (bill != null && bill.getBranch() != null) {
            payment.setBranch(bill.getBranch());
        }

        payment.setCustomer(customer);
        payment.setBill(bill);
        payment.setAmount(request.getAmount());
        payment.setNote(request.getNote());
        payment.setPaymentDate(LocalDateTime.now());
        return paymentRepository.save(payment);
    }
}
