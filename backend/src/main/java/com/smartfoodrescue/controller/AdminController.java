package com.smartfoodrescue.controller;

import com.smartfoodrescue.dto.DashboardStatsResponse;
import com.smartfoodrescue.dto.ListingResponse;
import com.smartfoodrescue.dto.RequestResponse;
import com.smartfoodrescue.dto.UserResponse;
import com.smartfoodrescue.service.AdminService;
import com.smartfoodrescue.service.ListingService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;
    private final ListingService listingService;

    public AdminController(AdminService adminService, ListingService listingService) {
        this.adminService = adminService;
        this.listingService = listingService;
    }

    @GetMapping("/stats")
    public DashboardStatsResponse stats() {
        return adminService.stats();
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return adminService.users();
    }

    @GetMapping("/listings")
    public List<ListingResponse> listings() {
        return listingService.all();
    }

    @GetMapping("/requests")
    public List<RequestResponse> requests() {
        return adminService.requests();
    }

    @PatchMapping("/users/{id}/toggle-status")
    public UserResponse toggleStatus(@PathVariable Long id) {
        return adminService.toggleUserStatus(id);
    }
}
