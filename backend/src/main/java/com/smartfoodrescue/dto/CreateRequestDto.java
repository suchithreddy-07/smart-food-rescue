package com.smartfoodrescue.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public class CreateRequestDto {
    @Min(1)
    private int requestedQuantity;

    @Size(max = 1000)
    private String message;

    public int getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(int requestedQuantity) { this.requestedQuantity = requestedQuantity; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
