package com.spareparts.controller;

import com.spareparts.config.JwtUtil;
import com.spareparts.dto.StockTransferRequest;
import com.spareparts.model.StockTransfer;
import com.spareparts.service.StockTransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock-transfers")
@CrossOrigin(origins = "*")
public class StockTransferController {

    @Autowired
    private StockTransferService stockTransferService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public List<StockTransfer> getTransfers(@RequestHeader("Authorization") String token) {
        Long businessId = jwtUtil.extractBusinessId(token.substring(7));
        return stockTransferService.getTransfersByBusiness(businessId);
    }

    @PostMapping
    public StockTransfer createTransfer(@RequestHeader("Authorization") String token, @RequestBody StockTransferRequest request) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return stockTransferService.createTransfer(userId, request);
    }

    @PutMapping("/{id}/status")
    public StockTransfer updateStatus(@RequestHeader("Authorization") String token, @PathVariable Long id, @RequestBody Map<String, String> body) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        return stockTransferService.updateTransferStatus(userId, id, body.get("status"));
    }
}
