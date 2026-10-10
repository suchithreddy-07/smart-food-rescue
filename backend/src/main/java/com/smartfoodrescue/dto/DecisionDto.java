package com.smartfoodrescue.dto;

import jakarta.validation.constraints.Size;

public class DecisionDto {
    @Size(max = 1000)
    private String providerNote;

    public String getProviderNote() { return providerNote; }
    public void setProviderNote(String providerNote) { this.providerNote = providerNote; }
}
