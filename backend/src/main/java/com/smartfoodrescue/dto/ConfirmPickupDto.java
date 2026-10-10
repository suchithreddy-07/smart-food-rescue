package com.smartfoodrescue.dto;

import jakarta.validation.constraints.NotBlank;

public class ConfirmPickupDto {
    @NotBlank
    private String qrToken;

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }
}
