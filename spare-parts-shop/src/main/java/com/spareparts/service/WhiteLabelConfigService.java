package com.spareparts.service;

import com.spareparts.config.TenantContext;
import com.spareparts.model.Business;
import com.spareparts.model.WhiteLabelConfig;
import com.spareparts.repository.BusinessRepository;
import com.spareparts.repository.WhiteLabelConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WhiteLabelConfigService {

    private final WhiteLabelConfigRepository whiteLabelConfigRepository;
    private final BusinessRepository businessRepository;

    @Transactional(readOnly = true)
    public WhiteLabelConfig getConfig() {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) throw new RuntimeException("No business context");

        return whiteLabelConfigRepository.findByBusinessId(businessId)
                .orElseGet(() -> {
                    WhiteLabelConfig defaultConfig = new WhiteLabelConfig();
                    defaultConfig.setIsEnabled(false);
                    return defaultConfig;
                });
    }

    @Transactional
    public WhiteLabelConfig updateConfig(WhiteLabelConfig request) {
        Long businessId = TenantContext.getBusinessId();
        if (businessId == null) throw new RuntimeException("No business context");

        WhiteLabelConfig config = whiteLabelConfigRepository.findByBusinessId(businessId)
                .orElseGet(() -> {
                    WhiteLabelConfig newConfig = new WhiteLabelConfig();
                    Business business = businessRepository.findById(businessId)
                            .orElseThrow(() -> new RuntimeException("Business not found"));
                    newConfig.setBusiness(business);
                    return newConfig;
                });

        config.setBrandName(request.getBrandName());
        config.setLogoUrl(request.getLogoUrl());
        config.setPrimaryColor(request.getPrimaryColor());
        config.setBackgroundColor(request.getBackgroundColor());
        config.setCustomDomain(request.getCustomDomain());
        config.setTagline(request.getTagline());
        config.setIsEnabled(request.getIsEnabled());

        return whiteLabelConfigRepository.save(config);
    }
}
