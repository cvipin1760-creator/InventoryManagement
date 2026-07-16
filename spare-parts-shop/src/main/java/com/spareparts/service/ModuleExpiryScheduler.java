package com.spareparts.service;

import com.spareparts.model.BusinessModule;
import com.spareparts.repository.BusinessModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ModuleExpiryScheduler {

    @Autowired
    private BusinessModuleRepository businessModuleRepository;

    @Scheduled(cron = "0 0 0 * * ?") // Runs every day at midnight
    public void checkTrialExpirations() {
        List<BusinessModule> modules = businessModuleRepository.findAll();
        for (BusinessModule bm : modules) {
            if (bm.getIsTrial() && bm.getIsEnabled() && bm.getTrialEndDate() != null) {
                if (bm.getTrialEndDate().isBefore(LocalDateTime.now())) {
                    bm.setIsEnabled(false);
                    businessModuleRepository.save(bm);
                    // Could also send an email/notification here
                }
            }
        }
    }
}
