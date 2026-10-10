package com.smartfoodrescue.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfoodrescue.dto.ListingResponse;
import com.smartfoodrescue.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class GeminiSearchService {
    private final ListingService listingService;
    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient = RestClient.create();

    public GeminiSearchService(ListingService listingService,
                               @Value("${app.gemini.api-key}") String apiKey,
                               @Value("${app.gemini.model}") String model) {
        this.listingService = listingService;
        this.apiKey = apiKey;
        this.model = model;
    }

    public List<ListingResponse> search(String naturalQuery) {
        List<ListingResponse> available = listingService.available(null, null, null);
        if (available.isEmpty()) {
            return List.of();
        }
        if (apiKey == null || apiKey.isBlank()) {
            return keywordFallback(naturalQuery, available);
        }
        try {
            String prompt = """
                    You match surplus food listings to an orphanage search query.
                    Return ONLY a JSON array of listing ids that best match, most relevant first.
                    Query: %s
                    Listings JSON: %s
                    """.formatted(naturalQuery, objectMapper.writeValueAsString(available));

            String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + model + ":generateContent?key=" + apiKey;
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
            );
            String response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(response);
            String text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
            text = text.replace("```json", "").replace("```", "").trim();
            JsonNode ids = objectMapper.readTree(text);
            List<Long> ordered = new ArrayList<>();
            if (ids.isArray()) {
                ids.forEach(n -> ordered.add(n.asLong()));
            }
            List<ListingResponse> ranked = new ArrayList<>();
            for (Long id : ordered) {
                available.stream().filter(l -> l.getId().equals(id)).findFirst().ifPresent(ranked::add);
            }
            if (ranked.isEmpty()) {
                return keywordFallback(naturalQuery, available);
            }
            return ranked;
        } catch (Exception ex) {
            return keywordFallback(naturalQuery, available);
        }
    }

    private List<ListingResponse> keywordFallback(String query, List<ListingResponse> available) {
        String q = query.toLowerCase(Locale.ROOT);
        List<ListingResponse> hits = available.stream()
                .filter(l -> contains(l.getTitle(), q)
                        || contains(l.getDescription(), q)
                        || contains(l.getFoodType(), q)
                        || contains(l.getCity(), q))
                .toList();
        if (hits.isEmpty() && (q.contains("vegetarian") || q.contains("veg"))) {
            return available.stream()
                    .filter(l -> contains(l.getFoodType(), "veg") || contains(l.getTitle(), "veg"))
                    .toList();
        }
        return hits.isEmpty() ? available : hits;
    }

    private boolean contains(String value, String q) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(q);
    }

    public void assertConfiguredOrFallbackOk() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Gemini API key is not configured. Set GEMINI_API_KEY on the server.");
        }
    }
}
