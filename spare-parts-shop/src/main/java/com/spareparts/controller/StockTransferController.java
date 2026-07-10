package com.spareparts.controller;

import com.spareparts.config.JwtUtil;
import com.spareparts.dto.StockTransferRequest;
import com.spareparts.model.StockTransfer;
import com.spareparts.service.StockTransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import com.spareparts.config.TenantContext;
import com.spareparts.model.User;
import com.spareparts.repository.UserRepository;

@RestController
@RequestMapping("/api/stock-transfers")
@CrossOrigin(origins = "*")
public class StockTransferController {

    @Autowired
    private StockTransferService stockTransferService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<StockTransfer>> getTransfers() {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(stockTransferService.getTransfersByBusiness(businessId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<StockTransfer> createTransfer(Principal principal, @RequestBody StockTransferRequest request) {
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();
        
        return ResponseEntity.ok(stockTransferService.createTransfer(user.getId(), request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<StockTransfer> updateStatus(Principal principal, @PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();
        
        return ResponseEntity.ok(stockTransferService.updateTransferStatus(user.getId(), id, body.get("status")));
    }
}
