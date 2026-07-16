package com.spareparts.service;

import com.spareparts.model.Business;
import com.spareparts.model.BusinessModule;
import com.spareparts.model.FeatureRequest;
import com.spareparts.model.ModuleDefinition;
import com.spareparts.repository.BusinessModuleRepository;
import com.spareparts.repository.BusinessRepository;
import com.spareparts.repository.FeatureRequestRepository;
import com.spareparts.repository.ModuleDefinitionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class FeatureRequestService {
    @Autowired
    private FeatureRequestRepository featureRequestRepository;
    
    @Autowired
    private BusinessModuleRepository businessModuleRepository;
    
    @Autowired
    private ModuleDefinitionRepository moduleDefinitionRepository;
    
    @Autowired
    private BusinessRepository businessRepository;

    public void approveRequest(Long requestId, int trialDays) {
        Optional<FeatureRequest> reqOpt = featureRequestRepository.findById(requestId);
        if (reqOpt.isPresent()) {
            FeatureRequest req = reqOpt.get();
            req.setStatus("APPROVED");
            featureRequestRepository.save(req);
            
            // Auto install module
            Optional<ModuleDefinition> modOpt = moduleDefinitionRepository.findByCode(req.getFeatureCode());
            if (modOpt.isPresent()) {
                BusinessModule bm = new BusinessModule();
                bm.setBusiness(req.getBusiness());
                bm.setModule(modOpt.get());
                bm.setIsEnabled(true);
                
                if (trialDays > 0) {
                    bm.setIsTrial(true);
                    bm.setTrialEndDate(LocalDateTime.now().plusDays(trialDays));
                }
                businessModuleRepository.save(bm);
            }
        }
    }
}
