package com.spareparts.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spareparts.config.TenantContext;
import com.spareparts.model.BusinessModule;
import com.spareparts.model.ModuleDefinition;
import com.spareparts.repository.BusinessModuleRepository;
import com.spareparts.repository.BillRepository;
import com.spareparts.repository.ModuleDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

/**
 * AI-powered module recommendation engine.
 * Analyses a business's transaction patterns and installed modules
 * to surface the most relevant missing modules using OpenRouter LLMs.
 */
@Service
@RequiredArgsConstructor
public class AiRecommendationService {

    private static final Logger log = LoggerFactory.getLogger(AiRecommendationService.class);

    private final BusinessModuleRepository businessModuleRepository;
    private final ModuleDefinitionRepository moduleDefinitionRepository;
    private final BillRepository billRepository;
    private final ObjectMapper objectMapper;

    @Value("${openrouter.api.key:}")
    private String openRouterApiKey;

    @Value("${openrouter.model:google/gemini-2.5-flash}")
    private String openRouterModel;

    /**
     * Returns a ranked list of module recommendations for the current business.
     * Each recommendation includes a reason and a confidence score (0–100).
     */
    public List<Map<String, Object>> getRecommendations() {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) return Collections.emptyList();

        // Get Business settings
        com.spareparts.model.Business business = businessModuleRepository.findByBusinessId(businessId)
                .stream().findFirst().map(BusinessModule::getBusiness).orElse(null);
        
        String apiKey = (business != null && business.getOpenRouterApiKey() != null && !business.getOpenRouterApiKey().isBlank()) 
                ? business.getOpenRouterApiKey() : openRouterApiKey;
        String model = (business != null && business.getOpenRouterModel() != null && !business.getOpenRouterModel().isBlank()) 
                ? business.getOpenRouterModel() : openRouterModel;

        // Installed module codes for this business
        Set<String> installed = new HashSet<>();
        for (BusinessModule bm : businessModuleRepository.findByBusinessId(businessId)) {
            if (bm.getModule() != null) installed.add(bm.getModule().getCode());
        }

        // Business signal: count of bills in the last 30 days
        long recentBills = billRepository.countByBusinessIdAndBillDateAfter(
                businessId, LocalDateTime.now().minusDays(30));

        // All available modules
        List<ModuleDefinition> allModules = moduleDefinitionRepository.findAll();
        List<Map<String, Object>> candidateModules = new ArrayList<>();

        for (ModuleDefinition mod : allModules) {
            if (!installed.contains(mod.getCode()) && !Boolean.TRUE.equals(mod.getIsCore())) {
                Map<String, Object> candidate = new HashMap<>();
                candidate.put("code", mod.getCode());
                candidate.put("name", mod.getName());
                candidate.put("category", mod.getCategory());
                candidate.put("price", mod.getMonthlyPrice());
                candidateModules.add(candidate);
            }
        }

        if (candidateModules.isEmpty()) {
            return Collections.emptyList();
        }

        // Try OpenRouter AI first
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                return getRecommendationsFromAi(recentBills, installed, candidateModules, apiKey, model);
            } catch (Exception e) {
                log.error("Failed to get AI recommendations from OpenRouter, falling back to rules.", e);
            }
        }

        // Fallback to Rule-based System
        return getRecommendationsFromRules(recentBills, installed, candidateModules);
    }

    private List<Map<String, Object>> getRecommendationsFromAi(
            long recentBills, Set<String> installed, List<Map<String, Object>> candidates, String apiKey, String model) throws Exception {
        
        String prompt = String.format(
                "You are an AI business advisor for an ERP/POS system. " +
                "The current business has generated %d bills in the last 30 days. " +
                "They currently have these modules installed: %s. " +
                "Here are the available modules they don't have yet: %s. " +
                "Based on their transaction volume and current modules, select the best modules for them. " +
                "Return a JSON array of objects. Each object must have: 'moduleCode' (string matching the code), " +
                "'score' (integer 0-100), 'reason' (string explaining why in 1 sentence). " +
                "Only return valid JSON array.",
                recentBills, installed, objectMapper.writeValueAsString(candidates));

        Map<String, Object> message = Map.of("role", "user", "content", prompt);
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(message),
                "response_format", Map.of("type", "json_object")
        );

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "http://localhost:8080")
                .header("X-Title", "StockPilot ERP")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            throw new RuntimeException("OpenRouter API returned status " + response.statusCode() + ": " + response.body());
        }

        Map<String, Object> responseMap = objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
        List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
        Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
        String content = (String) messageObj.get("content");
        
        // Strip markdown backticks if present
        if (content.startsWith("```json")) content = content.substring(7);
        if (content.startsWith("```")) content = content.substring(3);
        if (content.endsWith("```")) content = content.substring(0, content.length() - 3);

        List<Map<String, Object>> aiResults = objectMapper.readValue(content.trim(), new TypeReference<List<Map<String, Object>>>() {});

        // Enhance AI results with full module info
        List<Map<String, Object>> finalRecommendations = new ArrayList<>();
        for (Map<String, Object> aiRes : aiResults) {
            String code = (String) aiRes.get("moduleCode");
            candidates.stream().filter(c -> c.get("code").equals(code)).findFirst().ifPresent(candidate -> {
                Map<String, Object> rec = new LinkedHashMap<>();
                rec.put("moduleCode", code);
                rec.put("moduleName", candidate.get("name"));
                rec.put("category", candidate.get("category"));
                rec.put("monthlyPrice", candidate.get("price"));
                rec.put("score", aiRes.get("score"));
                rec.put("reason", aiRes.get("reason"));
                rec.put("ctaLabel", "Start Free Trial (AI Recommended)");
                finalRecommendations.add(rec);
            });
        }
        
        finalRecommendations.sort((a, b) -> Integer.compare((int) b.get("score"), (int) a.get("score")));
        return finalRecommendations.subList(0, Math.min(5, finalRecommendations.size()));
    }

    private List<Map<String, Object>> getRecommendationsFromRules(
            long recentBills, Set<String> installed, List<Map<String, Object>> candidates) {
        
        List<Map<String, Object>> recommendations = new ArrayList<>();

        for (Map<String, Object> mod : candidates) {
            String code = (String) mod.get("code");
            int score = computeScore(code, recentBills, installed);
            if (score > 0) {
                Map<String, Object> rec = new LinkedHashMap<>();
                rec.put("moduleCode", code);
                rec.put("moduleName", mod.get("name"));
                rec.put("category", mod.get("category"));
                rec.put("monthlyPrice", mod.get("price"));
                rec.put("score", score);
                rec.put("reason", getReason(code, recentBills));
                rec.put("ctaLabel", "Start Free Trial");
                recommendations.add(rec);
            }
        }

        recommendations.sort((a, b) -> Integer.compare((int) b.get("score"), (int) a.get("score")));
        return recommendations.subList(0, Math.min(5, recommendations.size()));
    }

    private int computeScore(String code, long recentBills, Set<String> installed) {
        return switch (code) {
            case "emi" -> recentBills > 50 ? 90 : recentBills > 20 ? 70 : 40;
            case "warranty" -> recentBills > 20 ? 85 : 50;
            case "multiBranch" -> recentBills > 200 ? 95 : recentBills > 100 ? 75 : 0;
            case "stockTransfer" -> installed.contains("multiBranch") ? 88 : 20;
            case "accounting" -> recentBills > 100 ? 80 : 55;
            case "marketing" -> recentBills > 30 ? 70 : 35;
            case "predictiveAnalytics" -> recentBills > 50 ? 75 : 30;
            case "b2b" -> recentBills > 100 ? 65 : 0;
            default -> 30;
        };
    }

    private String getReason(String code, long recentBills) {
        return switch (code) {
            case "emi" -> recentBills > 50
                    ? "You've had " + recentBills + " bills this month. Offer EMI to convert high-value customers."
                    : "Enable customer financing to increase average order value.";
            case "warranty" -> "Track product warranties and reduce customer service time by 40%.";
            case "multiBranch" -> "Your sales volume suggests you're ready to expand to a second location.";
            case "stockTransfer" -> "You already have Multi-Branch. Enable stock transfers to balance inventory automatically.";
            case "accounting" -> "Automate your month-end accounting by exporting directly to Tally or QuickBooks.";
            case "marketing" -> "Send targeted SMS/WhatsApp campaigns to your " + recentBills + " recent customers.";
            case "predictiveAnalytics" -> "Use AI to predict stock requirements and avoid stockouts.";
            case "b2b" -> "Open a B2B portal to let wholesale customers order directly from you.";
            default -> "Enhance your business operations with this module.";
        };
    }
}
