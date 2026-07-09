package com.spareparts.controller;

import com.spareparts.dto.SaaSAdminDashboardResponse;
import com.spareparts.model.PaymentGatewayConfig;
import com.spareparts.repository.PaymentGatewayConfigRepository;
import com.spareparts.service.AnalyticsService;
import com.spareparts.service.PlatformHealthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/saas")
public class SaaSAdminController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private PlatformHealthService platformHealthService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<SaaSAdminDashboardResponse> getDashboard() {
        SaaSAdminDashboardResponse response = new SaaSAdminDashboardResponse();
        response.setMetrics(analyticsService.getSaaSMetrics());
        response.setPlatformHealth(platformHealthService.getPlatformHealth());
        response.setAdminPerformances(analyticsService.getAdminPerformances());
        return ResponseEntity.ok(response);
    }

    @Autowired
    private PaymentGatewayConfigRepository paymentGatewayConfigRepository;

    @GetMapping("/gateways")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<PaymentGatewayConfig>> getGateways() {
        return ResponseEntity.ok(paymentGatewayConfigRepository.findAll());
    }

    @PostMapping("/gateways")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<PaymentGatewayConfig> createGateway(@RequestBody PaymentGatewayConfig config) {
        return ResponseEntity.ok(paymentGatewayConfigRepository.save(config));
    }

    @PutMapping("/gateways")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<PaymentGatewayConfig> updateGateway(@RequestBody PaymentGatewayConfig config) {
        return ResponseEntity.ok(paymentGatewayConfigRepository.save(config));
    }
}
