package com.spareparts.controller;

import com.spareparts.dto.PredictiveAnalyticsDto;
import com.spareparts.service.PredictiveAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics/predictive")
public class PredictiveAnalyticsController {

    @Autowired
    private PredictiveAnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'SUPER_MANAGER')")
    public ResponseEntity<PredictiveAnalyticsDto> getPredictiveAnalytics() {
        return ResponseEntity.ok(analyticsService.getPredictiveAnalytics());
    }
}
