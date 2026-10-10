package com.smartfoodrescue.controller;

import com.smartfoodrescue.dto.CreateRequestDto;
import com.smartfoodrescue.dto.DecisionDto;
import com.smartfoodrescue.dto.RequestResponse;
import com.smartfoodrescue.security.SecurityUtils;
import com.smartfoodrescue.service.RequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class RequestController {
    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping("/listings/{listingId}/requests")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ORPHANAGE')")
    public RequestResponse create(@PathVariable Long listingId, @Valid @RequestBody CreateRequestDto dto) {
        return requestService.create(SecurityUtils.currentUser(), listingId, dto);
    }

    @GetMapping("/requests/mine")
    @PreAuthorize("hasRole('ORPHANAGE')")
    public List<RequestResponse> mine() {
        return requestService.mine(SecurityUtils.currentUser());
    }

    @GetMapping("/requests/incoming")
    @PreAuthorize("hasAnyRole('PROVIDER','ADMIN')")
    public List<RequestResponse> incoming() {
        return requestService.forProvider(SecurityUtils.currentUser());
    }

    @PostMapping("/requests/{id}/accept")
    @PreAuthorize("hasAnyRole('PROVIDER','ADMIN')")
    public RequestResponse accept(@PathVariable Long id, @RequestBody(required = false) DecisionDto dto) {
        return requestService.accept(SecurityUtils.currentUser(), id, dto);
    }

    @PostMapping("/requests/{id}/reject")
    @PreAuthorize("hasAnyRole('PROVIDER','ADMIN')")
    public RequestResponse reject(@PathVariable Long id, @RequestBody(required = false) DecisionDto dto) {
        return requestService.reject(SecurityUtils.currentUser(), id, dto);
    }
}
