package com.smartfoodrescue.dto;

public class DashboardStatsResponse {
    private long providers;
    private long orphanages;
    private long listings;
    private long pendingRequests;
    private long completedPickups;
    private long mealsRescued;

    public DashboardStatsResponse(long providers, long orphanages, long listings,
                                  long pendingRequests, long completedPickups, long mealsRescued) {
        this.providers = providers;
        this.orphanages = orphanages;
        this.listings = listings;
        this.pendingRequests = pendingRequests;
        this.completedPickups = completedPickups;
        this.mealsRescued = mealsRescued;
    }

    public long getProviders() { return providers; }
    public long getOrphanages() { return orphanages; }
    public long getListings() { return listings; }
    public long getPendingRequests() { return pendingRequests; }
    public long getCompletedPickups() { return completedPickups; }
    public long getMealsRescued() { return mealsRescued; }
}
