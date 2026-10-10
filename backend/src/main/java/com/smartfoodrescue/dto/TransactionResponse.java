package com.smartfoodrescue.dto;

import com.smartfoodrescue.entity.FoodTransaction;
import java.time.Instant;

public class TransactionResponse {
    private Long id;
    private String listingTitle;
    private String providerName;
    private String orphanageName;
    private int quantity;
    private String unit;
    private String type;
    private Instant createdAt;

    public static TransactionResponse from(FoodTransaction t) {
        TransactionResponse r = new TransactionResponse();
        r.id = t.getId();
        r.listingTitle = t.getListing().getTitle();
        r.providerName = t.getProvider().getName();
        r.orphanageName = t.getOrphanage().getName();
        r.quantity = t.getQuantity();
        r.unit = t.getUnit();
        r.type = t.getType();
        r.createdAt = t.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getListingTitle() { return listingTitle; }
    public String getProviderName() { return providerName; }
    public String getOrphanageName() { return orphanageName; }
    public int getQuantity() { return quantity; }
    public String getUnit() { return unit; }
    public String getType() { return type; }
    public Instant getCreatedAt() { return createdAt; }
}
