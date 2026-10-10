package com.smartfoodrescue;

import java.time.LocalDate;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthAndListingFlowTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;

    @Test
    void healthIsPublic() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void registeredUserCanLogInAndInvalidPasswordIsRejected() throws Exception {
        register("Login Test", "login-test@example.com", "PROVIDER");
        String validLogin = objectMapper.writeValueAsString(Map.of(
                "email", "login-test@example.com",
                "password", "Password1"
        ));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validLogin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        String invalidLogin = objectMapper.writeValueAsString(Map.of(
                "email", "login-test@example.com",
                "password", "WrongPassword1"
        ));
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidLogin))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void providerCanListAndOrphanageCanRequestThenProviderAccepts() throws Exception {
        String providerToken = register("Green Kitchen", "provider@test.com", "PROVIDER");
        String orphanageToken = register("Hope Home", "orphanage@test.com", "ORPHANAGE");

        String listingJson = objectMapper.writeValueAsString(Map.of(
                "title", "Fresh bread",
                "description", "Surplus bakery loaves",
                "foodType", "Bakery",
                "quantity", 20,
                "unit", "loaves",
                "expiryDate", LocalDate.now().plusDays(1).toString(),
                "pickupAddress", "12 Market Street",
                "city", "Hyderabad"
        ));

        MvcResult created = mockMvc.perform(post("/api/listings")
                        .header("Authorization", "Bearer " + providerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(listingJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.remainingQuantity").value(20))
                .andReturn();
        long listingId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        String requestJson = objectMapper.writeValueAsString(Map.of(
                "requestedQuantity", 5,
                "message", "For dinner service"
        ));
        MvcResult requested = mockMvc.perform(post("/api/listings/" + listingId + "/requests")
                        .header("Authorization", "Bearer " + orphanageToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andReturn();
        long requestId = objectMapper.readTree(requested.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/requests/" + requestId + "/accept")
                        .header("Authorization", "Bearer " + providerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        mockMvc.perform(get("/api/listings/" + listingId)
                        .header("Authorization", "Bearer " + providerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.remainingQuantity").value(15));
    }

    private String register(String org, String email, String role) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "name", org,
                "email", email,
                "password", "Password1",
                "role", role,
                "organizationName", org,
                "city", "Hyderabad"
        ));
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }
}
