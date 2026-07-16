package com.spareparts.controller;

import com.spareparts.model.SuspendedCart;
import com.spareparts.security.JwtUtils;
import com.spareparts.service.SuspendedCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suspended-carts")
public class SuspendedCartController {

    @Autowired
    private SuspendedCartService suspendedCartService;

    @Autowired
    private JwtUtils jwtUtils;

    private Long getCurrentUserId(String token) {
        String jwt = token.substring(7);
        return jwtUtils.getUserIdFromToken(jwt);
    }

    @PostMapping
    public ResponseEntity<SuspendedCart> suspendCart(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> payload) {
        Long userId = getCurrentUserId(token);
        String customerName = payload.get("customerName");
        String cartDataJson = payload.get("cartDataJson");
        return ResponseEntity.ok(suspendedCartService.suspendCart(userId, customerName, cartDataJson));
    }

    @GetMapping
    public ResponseEntity<List<SuspendedCart>> getAllSuspendedCarts() {
        return ResponseEntity.ok(suspendedCartService.getAllSuspendedCarts());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSuspendedCart(@PathVariable Long id) {
        suspendedCartService.deleteSuspendedCart(id);
        return ResponseEntity.ok().build();
    }
}
