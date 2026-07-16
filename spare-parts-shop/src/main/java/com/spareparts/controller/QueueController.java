package com.spareparts.controller;

import com.spareparts.model.BillingCounter;
import com.spareparts.model.QueueEntry;
import com.spareparts.security.JwtUtils;
import com.spareparts.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/queue")
public class QueueController {

    @Autowired
    private QueueService queueService;

    @Autowired
    private JwtUtils jwtUtils;

    private Long getCurrentUserId(String token) {
        String jwt = token.substring(7);
        return jwtUtils.getUserIdFromToken(jwt);
    }

    @PostMapping("/counters")
    public ResponseEntity<BillingCounter> createCounter(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(queueService.createCounter(payload.get("name")));
    }

    @GetMapping("/counters")
    public ResponseEntity<List<BillingCounter>> getCounters() {
        return ResponseEntity.ok(queueService.getCounters());
    }

    @PostMapping("/counters/{id}/assign")
    public ResponseEntity<BillingCounter> assignCashier(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long userId = getCurrentUserId(token);
        return ResponseEntity.ok(queueService.assignCashierToCounter(id, userId));
    }

    @PostMapping("/counters/{id}/close")
    public ResponseEntity<BillingCounter> closeCounter(@PathVariable Long id) {
        return ResponseEntity.ok(queueService.closeCounter(id));
    }

    @PostMapping("/counters/{id}/join")
    public ResponseEntity<QueueEntry> joinQueue(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(queueService.joinQueue(id, payload.get("customerName")));
    }

    @GetMapping("/counters/{id}/entries")
    public ResponseEntity<List<QueueEntry>> getQueueForCounter(@PathVariable Long id) {
        return ResponseEntity.ok(queueService.getQueueForCounter(id));
    }

    @PostMapping("/counters/{id}/serve")
    public ResponseEntity<QueueEntry> serveNext(@PathVariable Long id) {
        return ResponseEntity.ok(queueService.serveNext(id));
    }

    @PostMapping("/entries/{id}/complete")
    public ResponseEntity<QueueEntry> completeService(@PathVariable Long id) {
        return ResponseEntity.ok(queueService.completeService(id));
    }
}
