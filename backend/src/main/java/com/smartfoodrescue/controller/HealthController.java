package com.smartfoodrescue.controller;

import com.smartfoodrescue.dto.DashboardStatsResponse;
import com.smartfoodrescue.service.AdminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HealthController {
    private final AdminService adminService;

    public HealthController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "smart-food-rescue");
    }

    @GetMapping("/api/stats/summary")
    public DashboardStatsResponse summary() {
        return adminService.stats();
    }
}
