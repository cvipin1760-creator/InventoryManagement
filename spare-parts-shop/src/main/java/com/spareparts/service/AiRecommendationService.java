package com.spareparts.service;

import com.spareparts.config.TenantContext;
import com.spareparts.model.BusinessModule;
import com.spareparts.model.ModuleDefinition;
import com.spareparts.repository.BusinessModuleRepository;
import com.spareparts.repository.BillRepository;
import com.spareparts.repository.ModuleDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * AI-powered module recommendation engine.
 * Analyses a business's transaction patterns and installed modules
 * to surface the most relevant missing modules.
 */
@Service
@RequiredArgsConstructor
public class AiRecommendationService {

    private final BusinessModuleRepository businessModuleRepository;
    private final ModuleDefinitionRepository moduleDefinitionRepository;
    private final BillRepository billRepository;

    /**
     * Returns a ranked list of module recommendations for the current business.
     * Each recommendation includes a reason and a confidence score (0–100).
     */
    public List<Map<String, Object>> getRecommendations() {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) return Collections.emptyList();

        // Installed module codes for this business
        Set<String> installed = new HashSet<>();
        for (BusinessModule bm : businessModuleRepository.findByBusinessId(businessId)) {
            if (bm.getModule() != null) installed.add(bm.getModule().getCode());
        }

        // Business signal: count of bills in the last 30 days
        long recentBills = billRepository.countByBusinessIdAndBillDateAfter(
                businessId, LocalDateTime.now().minusDays(30));

        List<Map<String, Object>> recommendations = new ArrayList<>();

        // All available modules
        List<ModuleDefinition> allModules = moduleDefinitionRepository.findAll();

        for (ModuleDefinition mod : allModules) {
            if (installed.contains(mod.getCode()) || Boolean.TRUE.equals(mod.getIsCore())) {
                continue; // skip already-installed and core
            }

            int score = computeScore(mod.getCode(), recentBills, installed);
            if (score > 0) {
                Map<String, Object> rec = new LinkedHashMap<>();
                rec.put("moduleCode", mod.getCode());
                rec.put("moduleName", mod.getName());
                rec.put("category", mod.getCategory());
                rec.put("monthlyPrice", mod.getMonthlyPrice());
                rec.put("score", score);
                rec.put("reason", getReason(mod.getCode(), recentBills));
                rec.put("ctaLabel", "Start Free Trial");
                recommendations.add(rec);
            }
        }

        // Sort by descending score
        recommendations.sort((a, b) -> Integer.compare((int) b.get("score"), (int) a.get("score")));

        // Return top 5
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
