package com.spareparts.controller;

import com.spareparts.model.ManagerApprovalRequest;
import com.spareparts.security.JwtUtils;
import com.spareparts.service.ApprovalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

    @Autowired
    private ApprovalService approvalService;

    @Autowired
    private JwtUtils jwtUtils;

    private Long getCurrentUserId(String token) {
        String jwt = token.substring(7);
        return jwtUtils.getUserIdFromToken(jwt);
    }

    @PostMapping("/request")
    public ResponseEntity<ManagerApprovalRequest> requestApproval(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> payload) {
        Long userId = getCurrentUserId(token);
        String actionType = payload.get("actionType");
        String detailsJson = payload.get("detailsJson");
        return ResponseEntity.ok(approvalService.createRequest(userId, actionType, detailsJson));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ManagerApprovalRequest>> getPendingRequests() {
        return ResponseEntity.ok(approvalService.getPendingRequests());
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<ManagerApprovalRequest> resolveRequest(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Boolean> payload) {
        Long approverId = getCurrentUserId(token);
        boolean approved = payload.get("approved");
        return ResponseEntity.ok(approvalService.resolveRequest(id, approverId, approved));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<ManagerApprovalRequest> checkStatus(@PathVariable Long id) {
        return ResponseEntity.ok(approvalService.checkStatus(id));
    }
}
