package com.spareparts.service;

import com.spareparts.model.Business;
import com.spareparts.model.CashDrawerTransaction;
import com.spareparts.model.Shift;
import com.spareparts.model.User;
import com.spareparts.repository.BusinessRepository;
import com.spareparts.repository.CashDrawerTransactionRepository;
import com.spareparts.repository.ShiftRepository;
import com.spareparts.repository.UserRepository;
import com.spareparts.config.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ShiftService {

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private CashDrawerTransactionRepository cashDrawerTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessRepository businessRepository;

    public Shift startShift(Long userId, Double openingBalance, String notes) {
        Long businessId = TenantContext.getBusinessId();
        
        Optional<Shift> existingOpenShift = shiftRepository.findByUserIdAndBusinessIdAndStatus(userId, businessId, "OPEN");
        if (existingOpenShift.isPresent()) {
            throw new RuntimeException("User already has an open shift");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Business business = businessRepository.findById(businessId).orElseThrow();

        Shift shift = new Shift();
        shift.setUser(user);
        shift.setBusiness(business);
        shift.setOpeningBalance(openingBalance);
        shift.setStatus("OPEN");
        shift.setStartTime(LocalDateTime.now());
        shift.setNotes(notes);

        shift = shiftRepository.save(shift);

        if (openingBalance > 0) {
            CashDrawerTransaction txn = new CashDrawerTransaction();
            txn.setShift(shift);
            txn.setBusiness(business);
            txn.setAmount(openingBalance);
            txn.setType("ADD");
            txn.setReason("Opening Balance");
            txn.setTimestamp(LocalDateTime.now());
            cashDrawerTransactionRepository.save(txn);
        }

        return shift;
    }

    public Shift endShift(Long shiftId, Double closingBalance, String notes) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found"));

        if (!"OPEN".equals(shift.getStatus())) {
            throw new RuntimeException("Shift is already closed");
        }

        shift.setClosingBalance(closingBalance);
        
        // Calculate expected cash based on transactions
        List<CashDrawerTransaction> txns = cashDrawerTransactionRepository.findByShiftIdOrderByTimestampDesc(shiftId);
        double expectedBalance = 0.0;
        for (CashDrawerTransaction txn : txns) {
            if ("ADD".equals(txn.getType()) || "SALE".equals(txn.getType())) {
                expectedBalance += txn.getAmount();
            } else if ("REMOVE".equals(txn.getType()) || "REFUND".equals(txn.getType())) {
                expectedBalance -= txn.getAmount();
            }
        }
        
        shift.setCashDifference(closingBalance - expectedBalance);
        shift.setStatus("CLOSED");
        shift.setEndTime(LocalDateTime.now());
        if (notes != null && !notes.isEmpty()) {
            shift.setNotes(shift.getNotes() + "\nClosing Notes: " + notes);
        }

        return shiftRepository.save(shift);
    }

    public Optional<Shift> getCurrentShift(Long userId) {
        Long businessId = TenantContext.getBusinessId();
        return shiftRepository.findByUserIdAndBusinessIdAndStatus(userId, businessId, "OPEN");
    }

    public CashDrawerTransaction adjustCash(Long shiftId, Double amount, String type, String reason) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Shift not found"));

        if (!"OPEN".equals(shift.getStatus())) {
            throw new RuntimeException("Cannot adjust cash on a closed shift");
        }

        CashDrawerTransaction txn = new CashDrawerTransaction();
        txn.setShift(shift);
        txn.setBusiness(shift.getBusiness() != null ? shift.getBusiness() : null);
        txn.setAmount(amount);
        txn.setType(type); // ADD or REMOVE
        txn.setReason(reason);
        txn.setTimestamp(LocalDateTime.now());

        return cashDrawerTransactionRepository.save(txn);
    }

    public List<Shift> getAllShifts() {
        return shiftRepository.findByBusinessIdOrderByStartTimeDesc(TenantContext.getBusinessId());
    }
}
