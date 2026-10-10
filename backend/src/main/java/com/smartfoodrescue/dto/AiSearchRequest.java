package com.smartfoodrescue.dto;

import jakarta.validation.constraints.NotBlank;

public class AiSearchRequest {
    @NotBlank
    private String query;

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
}
