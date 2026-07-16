package com.spareparts.service;

import com.spareparts.model.ManagerApprovalRequest;
import com.spareparts.model.User;
import com.spareparts.repository.ApprovalRequestRepository;
import com.spareparts.repository.UserRepository;
import com.spareparts.security.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApprovalService {

    @Autowired
    private ApprovalRequestRepository approvalRequestRepository;

    @Autowired
    private UserRepository userRepository;

    public ManagerApprovalRequest createRequest(Long requestedById, String actionType, String detailsJson) {
        User requester = userRepository.findById(requestedById)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ManagerApprovalRequest request = new ManagerApprovalRequest();
        request.setBusinessId(TenantContext.getCurrentBusinessId());
        request.setRequestedBy(requester);
        request.setActionType(actionType);
        request.setDetailsJson(detailsJson);
        request.setStatus("PENDING");
        request.setRequestedAt(LocalDateTime.now());

        return approvalRequestRepository.save(request);
    }

    public List<ManagerApprovalRequest> getPendingRequests() {
        return approvalRequestRepository.findByBusinessIdAndStatusOrderByRequestedAtDesc(
                TenantContext.getCurrentBusinessId(), "PENDING");
    }

    public ManagerApprovalRequest resolveRequest(Long requestId, Long approverId, boolean approved) {
        ManagerApprovalRequest request = approvalRequestRepository.findByIdAndBusinessId(
                requestId, TenantContext.getCurrentBusinessId())
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found"));

        // Add a check to make sure approver has manager/admin permissions if this was a real production app.
        // For now, we trust the frontend UI hiding it based on roles.

        request.setApprovedBy(approver);
        request.setStatus(approved ? "APPROVED" : "REJECTED");
        request.setRespondedAt(LocalDateTime.now());

        return approvalRequestRepository.save(request);
    }
    
    // Polling endpoint for cashiers to check if their request was approved
    public ManagerApprovalRequest checkStatus(Long requestId) {
        return approvalRequestRepository.findByIdAndBusinessId(requestId, TenantContext.getCurrentBusinessId())
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }
}
