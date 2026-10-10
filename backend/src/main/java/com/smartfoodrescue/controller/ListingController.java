package com.smartfoodrescue.controller;

import com.smartfoodrescue.dto.ListingRequest;
import com.smartfoodrescue.dto.ListingResponse;
import com.smartfoodrescue.dto.RequestResponse;
import com.smartfoodrescue.security.SecurityUtils;
import com.smartfoodrescue.service.ListingService;
import com.smartfoodrescue.service.RequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
public class ListingController {
    private final ListingService listingService;
    private final RequestService requestService;

    public ListingController(ListingService listingService, RequestService requestService) {
        this.listingService = listingService;
        this.requestService = requestService;
    }

    @GetMapping("/available")
    public List<ListingResponse> available(@RequestParam(required = false) String q,
                                           @RequestParam(required = false) String city,
                                           @RequestParam(required = false) String foodType) {
        return listingService.available(q, city, foodType);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('PROVIDER','ADMIN')")
    public List<ListingResponse> mine() {
        return listingService.mine(SecurityUtils.currentUser());
    }

    @GetMapping("/{id}")
    public ListingResponse get(@PathVariable Long id) {
        return listingService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('PROVIDER','ADMIN')")
    public ListingResponse create(@Valid @RequestBody ListingRequest request) {
        return listingService.create(SecurityUtils.currentUser(), request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROVIDER','ADMIN')")
    public ListingResponse update(@PathVariable Long id, @Valid @RequestBody ListingRequest request) {
        return listingService.update(SecurityUtils.currentUser(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('PROVIDER','ADMIN')")
    public void cancel(@PathVariable Long id) {
        listingService.cancel(SecurityUtils.currentUser(), id);
    }

    @GetMapping("/{id}/requests")
    @PreAuthorize("hasAnyRole('PROVIDER','ADMIN')")
    public List<RequestResponse> listingRequests(@PathVariable Long id) {
        return requestService.forListing(SecurityUtils.currentUser(), id);
    }
}
