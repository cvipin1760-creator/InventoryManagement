package com.spareparts.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaaSAdminDashboardResponse {
    private SaaSMetrics metrics;
    private SystemHealth platformHealth;
    private List<AdminPerformance> adminPerformances;
    // We can leave the map locations and leaderboards for a future iteration or mock them partially if needed.
}
