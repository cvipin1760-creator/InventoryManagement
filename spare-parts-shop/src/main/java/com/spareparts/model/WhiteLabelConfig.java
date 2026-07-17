package com.spareparts.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

/**
 * Stores white-label branding configuration for Enterprise subscriptions.
 * Allows businesses to customise their app's identity (logo, colours, domain).
 */
@Entity
@Table(name = "white_label_configs")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WhiteLabelConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", unique = true)
    private Business business;

    /** Display name shown in the mobile/web app header */
    private String brandName;

    /** URL to logo image (hosted CDN or data URI) */
    @Column(length = 2048)
    private String logoUrl;

    /** Hex colour for primary actions e.g. #6366F1 */
    private String primaryColor;

    /** Hex colour for background/surface e.g. #0F172A */
    private String backgroundColor;

    /** Custom domain for the web portal e.g. billing.mybusiness.com */
    private String customDomain;

    /** Footer tagline */
    private String tagline;

    /** Whether white-labelling is active for this business */
    private Boolean isEnabled = false;
}
