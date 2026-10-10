package com.smartfoodrescue.dto;

import com.smartfoodrescue.domain.PickupStatus;
import com.smartfoodrescue.entity.Pickup;
import java.time.Instant;
import java.time.LocalDateTime;

public class PickupResponse {
    private Long id;
    private Long requestId;
    private Long listingId;
    private String listingTitle;
    private String orphanageName;
    private String providerName;
    private LocalDateTime scheduledAt;
    private String pickupLocation;
    private PickupStatus status;
    private String qrToken;
    private Instant collectedAt;

    public static PickupResponse from(Pickup pickup, boolean includeQr) {
        PickupResponse r = new PickupResponse();
        r.id = pickup.getId();
        r.requestId = pickup.getRequest().getId();
        r.listingId = pickup.getRequest().getListing().getId();
        r.listingTitle = pickup.getRequest().getListing().getTitle();
        r.orphanageName = pickup.getRequest().getOrphanage().getName();
        r.providerName = pickup.getRequest().getListing().getProvider().getName();
        r.scheduledAt = pickup.getScheduledAt();
        r.pickupLocation = pickup.getPickupLocation();
        r.status = pickup.getStatus();
        r.qrToken = includeQr ? pickup.getQrToken() : null;
        r.collectedAt = pickup.getCollectedAt();
        return r;
    }

    public Long getId() { return id; }
    public Long getRequestId() { return requestId; }
    public Long getListingId() { return listingId; }
    public String getListingTitle() { return listingTitle; }
    public String getOrphanageName() { return orphanageName; }
    public String getProviderName() { return providerName; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public String getPickupLocation() { return pickupLocation; }
    public PickupStatus getStatus() { return status; }
    public String getQrToken() { return qrToken; }
    public Instant getCollectedAt() { return collectedAt; }
}
