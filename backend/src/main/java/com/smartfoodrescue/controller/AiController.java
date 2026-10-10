package com.smartfoodrescue.controller;

import com.smartfoodrescue.dto.AiSearchRequest;
import com.smartfoodrescue.dto.ListingResponse;
import com.smartfoodrescue.service.GeminiSearchService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final GeminiSearchService geminiSearchService;

    public AiController(GeminiSearchService geminiSearchService) {
        this.geminiSearchService = geminiSearchService;
    }

    @PostMapping("/search")
    public Map<String, Object> search(@Valid @RequestBody AiSearchRequest request) {
        List<ListingResponse> results = geminiSearchService.search(request.getQuery());
        return Map.of("query", request.getQuery(), "results", results);
    }
}
