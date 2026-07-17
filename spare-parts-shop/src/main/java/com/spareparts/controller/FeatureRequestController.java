package com.spareparts.controller;

import com.spareparts.config.TenantContext;
import com.spareparts.model.FeatureRequest;
import com.spareparts.repository.BusinessRepository;
import com.spareparts.repository.FeatureRequestRepository;
import com.spareparts.repository.UserRepository;
import com.spareparts.service.FeatureRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/feature-requests")
@RequiredArgsConstructor
public class FeatureRequestController {

    private final FeatureRequestRepository featureRequestRepository;
    private final FeatureRequestService featureRequestService;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<FeatureRequest> requestFeature(@RequestBody FeatureRequest request) {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) return ResponseEntity.badRequest().build();
        
        request.setBusiness(businessRepository.findById(businessId).orElse(null));
        request.setStatus("PENDING");
        return ResponseEntity.ok(featureRequestRepository.save(request));
    }

    @GetMapping
    public ResponseEntity<List<FeatureRequest>> getRequests() {
        return ResponseEntity.ok(featureRequestRepository.findAll());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approveRequest(@PathVariable Long id, @RequestParam(defaultValue = "0") int trialDays) {
        featureRequestService.approveRequest(id, trialDays);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> rejectRequest(@PathVariable Long id) {
        featureRequestService.rejectRequest(id);
        return ResponseEntity.ok().build();
    }
}
