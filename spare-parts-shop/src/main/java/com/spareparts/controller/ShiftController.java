package com.spareparts.controller;

import com.spareparts.model.CashDrawerTransaction;
import com.spareparts.model.Shift;
import com.spareparts.security.JwtUtils;
import com.spareparts.service.ShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    @Autowired
    private ShiftService shiftService;

    @Autowired
    private JwtUtils jwtUtils;

    private Long getCurrentUserId(String token) {
        String jwt = token.substring(7);
        return jwtUtils.getUserIdFromToken(jwt);
    }

    @PostMapping("/start")
    public ResponseEntity<Shift> startShift(@RequestHeader("Authorization") String token, @RequestBody Map<String, Object> payload) {
        Long userId = getCurrentUserId(token);
        Double openingBalance = Double.valueOf(payload.getOrDefault("openingBalance", "0").toString());
        String notes = (String) payload.get("notes");
        return ResponseEntity.ok(shiftService.startShift(userId, openingBalance, notes));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<Shift> endShift(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Double closingBalance = Double.valueOf(payload.getOrDefault("closingBalance", "0").toString());
        String notes = (String) payload.get("notes");
        return ResponseEntity.ok(shiftService.endShift(id, closingBalance, notes));
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentShift(@RequestHeader("Authorization") String token) {
        Long userId = getCurrentUserId(token);
        return shiftService.getCurrentShift(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/{id}/adjust-cash")
    public ResponseEntity<CashDrawerTransaction> adjustCash(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Double amount = Double.valueOf(payload.get("amount").toString());
        String type = (String) payload.get("type");
        String reason = (String) payload.get("reason");
        return ResponseEntity.ok(shiftService.adjustCash(id, amount, type, reason));
    }

    @GetMapping
    public ResponseEntity<List<Shift>> getAllShifts() {
        return ResponseEntity.ok(shiftService.getAllShifts());
    }
}
