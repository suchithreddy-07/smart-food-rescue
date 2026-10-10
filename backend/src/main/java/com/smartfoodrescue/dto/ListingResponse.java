package com.smartfoodrescue.dto;

import com.smartfoodrescue.domain.ListingStatus;
import com.smartfoodrescue.entity.FoodListing;
import java.time.Instant;
import java.time.LocalDate;

public class ListingResponse {
    private Long id;
    private Long providerId;
    private String providerName;
    private String organizationName;
    private String title;
    private String description;
    private String foodType;
    private int quantity;
    private int remainingQuantity;
    private String unit;
    private LocalDate expiryDate;
    private String pickupAddress;
    private String city;
    private ListingStatus status;
    private Instant createdAt;

    public static ListingResponse from(FoodListing listing) {
        ListingResponse r = new ListingResponse();
        r.id = listing.getId();
        r.providerId = listing.getProvider().getId();
        r.providerName = listing.getProvider().getName();
        r.organizationName = listing.getProvider().getOrganizationName();
        r.title = listing.getTitle();
        r.description = listing.getDescription();
        r.foodType = listing.getFoodType();
        r.quantity = listing.getQuantity();
        r.remainingQuantity = listing.getRemainingQuantity();
        r.unit = listing.getUnit();
        r.expiryDate = listing.getExpiryDate();
        r.pickupAddress = listing.getPickupAddress();
        r.city = listing.getCity();
        r.status = listing.getStatus();
        r.createdAt = listing.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public Long getProviderId() { return providerId; }
    public String getProviderName() { return providerName; }
    public String getOrganizationName() { return organizationName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getFoodType() { return foodType; }
    public int getQuantity() { return quantity; }
    public int getRemainingQuantity() { return remainingQuantity; }
    public String getUnit() { return unit; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public String getPickupAddress() { return pickupAddress; }
    public String getCity() { return city; }
    public ListingStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
