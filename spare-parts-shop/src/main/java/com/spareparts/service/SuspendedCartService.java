package com.spareparts.service;

import com.spareparts.model.SuspendedCart;
import com.spareparts.model.User;
import com.spareparts.repository.SuspendedCartRepository;
import com.spareparts.repository.UserRepository;
import com.spareparts.security.TenantContext;
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

    public SuspendedCart suspendCart(Long cashierId, String customerName, String cartDataJson) {
        Long businessId = TenantContext.getCurrentBusinessId();
        
        User cashier = userRepository.findById(cashierId)
                .orElseThrow(() -> new RuntimeException("Cashier not found"));

        SuspendedCart cart = new SuspendedCart();
        cart.setBusinessId(businessId);
        cart.setCashier(cashier);
        cart.setCustomerName(customerName);
        cart.setCartDataJson(cartDataJson);
        cart.setSuspendedAt(LocalDateTime.now());

        return suspendedCartRepository.save(cart);
    }

    public List<SuspendedCart> getAllSuspendedCarts() {
        return suspendedCartRepository.findByBusinessIdOrderBySuspendedAtDesc(TenantContext.getCurrentBusinessId());
    }

    public void deleteSuspendedCart(Long id) {
        SuspendedCart cart = suspendedCartRepository.findByIdAndBusinessId(id, TenantContext.getCurrentBusinessId())
                .orElseThrow(() -> new RuntimeException("Suspended Cart not found"));
        suspendedCartRepository.delete(cart);
    }
}
