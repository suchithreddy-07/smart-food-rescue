package com.smartfoodrescue.dto;

import com.smartfoodrescue.domain.RequestStatus;
import com.smartfoodrescue.entity.FoodRequest;
import java.time.Instant;

public class RequestResponse {
    private Long id;
    private Long listingId;
    private String listingTitle;
    private Long orphanageId;
    private String orphanageName;
    private String organizationName;
    private int requestedQuantity;
    private String unit;
    private RequestStatus status;
    private String message;
    private String providerNote;
    private Instant createdAt;

    public static RequestResponse from(FoodRequest request) {
        RequestResponse r = new RequestResponse();
        r.id = request.getId();
        r.listingId = request.getListing().getId();
        r.listingTitle = request.getListing().getTitle();
        r.orphanageId = request.getOrphanage().getId();
        r.orphanageName = request.getOrphanage().getName();
        r.organizationName = request.getOrphanage().getOrganizationName();
        r.requestedQuantity = request.getRequestedQuantity();
        r.unit = request.getListing().getUnit();
        r.status = request.getStatus();
        r.message = request.getMessage();
        r.providerNote = request.getProviderNote();
        r.createdAt = request.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public Long getListingId() { return listingId; }
    public String getListingTitle() { return listingTitle; }
    public Long getOrphanageId() { return orphanageId; }
    public String getOrphanageName() { return orphanageName; }
    public String getOrganizationName() { return organizationName; }
    public int getRequestedQuantity() { return requestedQuantity; }
    public String getUnit() { return unit; }
    public RequestStatus getStatus() { return status; }
    public String getMessage() { return message; }
    public String getProviderNote() { return providerNote; }
    public Instant getCreatedAt() { return createdAt; }
}
