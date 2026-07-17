package com.spareparts.controller;

import com.spareparts.service.AiRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiRecommendationController {

    private final AiRecommendationService aiRecommendationService;

    /**
     * GET /api/ai/recommendations
     * Returns ranked module recommendations for the authenticated business.
     */
    @GetMapping("/recommendations")
    public ResponseEntity<List<Map<String, Object>>> getRecommendations() {
        return ResponseEntity.ok(aiRecommendationService.getRecommendations());
    }
}
