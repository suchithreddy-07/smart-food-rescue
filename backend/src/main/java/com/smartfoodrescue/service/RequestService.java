package com.smartfoodrescue.service;

import com.smartfoodrescue.domain.ListingStatus;
import com.smartfoodrescue.domain.RequestStatus;
import com.smartfoodrescue.domain.Role;
import com.smartfoodrescue.dto.CreateRequestDto;
import com.smartfoodrescue.dto.DecisionDto;
import com.smartfoodrescue.dto.RequestResponse;
import com.smartfoodrescue.entity.FoodListing;
import com.smartfoodrescue.entity.FoodRequest;
import com.smartfoodrescue.entity.User;
import com.smartfoodrescue.exception.ApiException;
import com.smartfoodrescue.repository.FoodListingRepository;
import com.smartfoodrescue.repository.FoodRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class RequestService {
    private final FoodRequestRepository requestRepository;
    private final FoodListingRepository listingRepository;

    public RequestService(FoodRequestRepository requestRepository, FoodListingRepository listingRepository) {
        this.requestRepository = requestRepository;
        this.listingRepository = listingRepository;
    }

    @Transactional
    public RequestResponse create(User orphanage, Long listingId, CreateRequestDto dto) {
        if (orphanage.getRole() != Role.ORPHANAGE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only orphanages can request food");
        }
        FoodListing listing = listingRepository.findByIdForUpdate(listingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Listing not found"));
        if (listing.getStatus() != ListingStatus.AVAILABLE || listing.getRemainingQuantity() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This listing is not available");
        }
        if (dto.getRequestedQuantity() > listing.getRemainingQuantity()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Requested quantity exceeds remaining " + listing.getRemainingQuantity());
        }
        if (requestRepository.existsByListingAndOrphanageAndStatus(listing, orphanage, RequestStatus.PENDING)) {
            throw new ApiException(HttpStatus.CONFLICT, "You already have a pending request for this listing");
        }
        FoodRequest request = new FoodRequest();
        request.setListing(listing);
        request.setOrphanage(orphanage);
        request.setRequestedQuantity(dto.getRequestedQuantity());
        request.setMessage(dto.getMessage());
        return RequestResponse.from(requestRepository.save(request));
    }

    @Transactional
    public RequestResponse accept(User provider, Long requestId, DecisionDto dto) {
        FoodRequest request = loadForProvider(provider, requestId);
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending requests can be accepted");
        }
        FoodListing listing = listingRepository.findByIdForUpdate(request.getListing().getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Listing not found"));
        if (request.getRequestedQuantity() > listing.getRemainingQuantity()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Not enough remaining quantity to accept this request");
        }
        listing.setRemainingQuantity(listing.getRemainingQuantity() - request.getRequestedQuantity());
        if (listing.getRemainingQuantity() <= 0) {
            listing.setStatus(ListingStatus.DEPLETED);
        }
        listingRepository.save(listing);
        request.setStatus(RequestStatus.ACCEPTED);
        request.setProviderNote(dto == null ? null : dto.getProviderNote());
        return RequestResponse.from(requestRepository.save(request));
    }

    @Transactional
    public RequestResponse reject(User provider, Long requestId, DecisionDto dto) {
        FoodRequest request = loadForProvider(provider, requestId);
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending requests can be rejected");
        }
        request.setStatus(RequestStatus.REJECTED);
        request.setProviderNote(dto == null ? null : dto.getProviderNote());
        return RequestResponse.from(requestRepository.save(request));
    }

    public List<RequestResponse> mine(User orphanage) {
        return requestRepository.findByOrphanageOrderByCreatedAtDesc(orphanage)
                .stream().map(RequestResponse::from).toList();
    }

    public List<RequestResponse> forProvider(User provider) {
        return requestRepository.findByProviderId(provider.getId())
                .stream().map(RequestResponse::from).toList();
    }

    public List<RequestResponse> forListing(User provider, Long listingId) {
        FoodListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Listing not found"));
        if (!listing.getProvider().getId().equals(provider.getId()) && provider.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        return requestRepository.findByListingOrderByCreatedAtDesc(listing)
                .stream().map(RequestResponse::from).toList();
    }

    private FoodRequest loadForProvider(User provider, Long requestId) {
        FoodRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Request not found"));
        if (!request.getListing().getProvider().getId().equals(provider.getId()) && provider.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only decide on requests for your listings");
        }
        return request;
    }
}
