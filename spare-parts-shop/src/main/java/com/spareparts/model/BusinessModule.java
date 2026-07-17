package com.spareparts.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "business_modules")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BusinessModule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "business_id")
    private Business business;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "module_id")
    private ModuleDefinition module;

    private Boolean isEnabled = true;
    private Boolean isTrial = false;

    private LocalDateTime trialEndDate;
    private LocalDateTime expiryDate;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt = LocalDateTime.now();

    /**
     * Returns human-readable status for the frontend.
     */
    public String getStatus() {
        if (!Boolean.TRUE.equals(isEnabled)) return "DISABLED";
        if (Boolean.TRUE.equals(isTrial)) {
            if (trialEndDate != null && LocalDateTime.now().isAfter(trialEndDate)) {
                return "EXPIRED";
            }
            return "TRIAL";
        }
        return "ACTIVE";
    }

    /**
     * Convenience alias for trialEndDate for JSON serialisation.
     */
    public LocalDateTime getTrialEnd() {
        return trialEndDate;
    }
}
