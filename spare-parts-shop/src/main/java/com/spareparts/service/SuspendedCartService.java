package com.spareparts.service;

import com.spareparts.model.Business;
import com.spareparts.model.SuspendedCart;
import com.spareparts.model.User;
import com.spareparts.repository.BusinessRepository;
import com.spareparts.repository.SuspendedCartRepository;
import com.spareparts.repository.UserRepository;
import com.spareparts.config.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SuspendedCartService {

    @Autowired
    private SuspendedCartRepository suspendedCartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessRepository businessRepository;

    public SuspendedCart suspendCart(Long cashierId, String customerName, String cartDataJson) {
        Long businessId = TenantContext.getBusinessId();
        
        User cashier = userRepository.findById(cashierId)
                .orElseThrow(() -> new RuntimeException("Cashier not found"));

        Business business = businessRepository.findById(businessId).orElseThrow();

        SuspendedCart cart = new SuspendedCart();
        cart.setBusiness(business);
        cart.setCashier(cashier);
        cart.setCustomerName(customerName);
        cart.setCartDataJson(cartDataJson);
        cart.setSuspendedAt(LocalDateTime.now());

        return suspendedCartRepository.save(cart);
    }

    public List<SuspendedCart> getAllSuspendedCarts() {
        return suspendedCartRepository.findByBusinessIdOrderBySuspendedAtDesc(TenantContext.getBusinessId());
    }

    public void deleteSuspendedCart(Long id) {
        SuspendedCart cart = suspendedCartRepository.findByIdAndBusinessId(id, TenantContext.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Suspended Cart not found"));
        suspendedCartRepository.delete(cart);
    }
}
