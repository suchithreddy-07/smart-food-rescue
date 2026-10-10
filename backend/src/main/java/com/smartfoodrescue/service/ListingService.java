package com.smartfoodrescue.service;

import com.smartfoodrescue.domain.ListingStatus;
import com.smartfoodrescue.domain.Role;
import com.smartfoodrescue.dto.ListingRequest;
import com.smartfoodrescue.dto.ListingResponse;
import com.smartfoodrescue.entity.FoodListing;
import com.smartfoodrescue.entity.User;
import com.smartfoodrescue.exception.ApiException;
import com.smartfoodrescue.repository.FoodListingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class ListingService {
    private final FoodListingRepository listingRepository;

    public ListingService(FoodListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    public ListingResponse create(User provider, ListingRequest request) {
        requireProvider(provider);
        FoodListing listing = new FoodListing();
        listing.setProvider(provider);
        apply(listing, request, true);
        return ListingResponse.from(listingRepository.save(listing));
    }

    public ListingResponse update(User provider, Long id, ListingRequest request) {
        FoodListing listing = ownedListing(provider, id);
        if (listing.getStatus() == ListingStatus.CANCELLED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cancelled listings cannot be edited");
        }
        apply(listing, request, false);
        return ListingResponse.from(listingRepository.save(listing));
    }

    public void cancel(User provider, Long id) {
        FoodListing listing = ownedListing(provider, id);
        listing.setStatus(ListingStatus.CANCELLED);
        listingRepository.save(listing);
    }

    public List<ListingResponse> mine(User provider) {
        requireProvider(provider);
        return listingRepository.findByProviderOrderByCreatedAtDesc(provider)
                .stream().map(ListingResponse::from).toList();
    }

    public List<ListingResponse> available(String q, String city, String foodType) {
        String query = blankToNull(q);
        String cityFilter = blankToNull(city);
        String typeFilter = blankToNull(foodType);
        expireStale();
        return listingRepository.searchAvailable(query, cityFilter, typeFilter)
                .stream().map(ListingResponse::from).toList();
    }

    public ListingResponse get(Long id) {
        return ListingResponse.from(find(id));
    }

    public List<ListingResponse> all() {
        return listingRepository.findAll().stream().map(ListingResponse::from).toList();
    }

    private void expireStale() {
        listingRepository.findByStatusAndRemainingQuantityGreaterThanOrderByCreatedAtDesc(ListingStatus.AVAILABLE, 0)
                .stream()
                .filter(l -> l.getExpiryDate() != null && l.getExpiryDate().isBefore(LocalDate.now()))
                .forEach(l -> {
                    l.setStatus(ListingStatus.EXPIRED);
                    listingRepository.save(l);
                });
    }

    private void apply(FoodListing listing, ListingRequest request, boolean creating) {
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setFoodType(request.getFoodType());
        listing.setUnit(request.getUnit());
        listing.setExpiryDate(request.getExpiryDate());
        listing.setPickupAddress(request.getPickupAddress());
        listing.setCity(request.getCity());
        if (creating) {
            listing.setQuantity(request.getQuantity());
            listing.setRemainingQuantity(request.getQuantity());
            listing.setStatus(ListingStatus.AVAILABLE);
        } else {
            int reserved = listing.getQuantity() - listing.getRemainingQuantity();
            if (request.getQuantity() < reserved) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Quantity cannot be lower than already reserved amount (" + reserved + ")");
            }
            listing.setQuantity(request.getQuantity());
            listing.setRemainingQuantity(request.getQuantity() - reserved);
            if (listing.getRemainingQuantity() > 0 && listing.getStatus() == ListingStatus.DEPLETED) {
                listing.setStatus(ListingStatus.AVAILABLE);
            }
        }
    }

    private FoodListing ownedListing(User provider, Long id) {
        requireProvider(provider);
        FoodListing listing = find(id);
        if (!listing.getProvider().getId().equals(provider.getId()) && provider.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage your own listings");
        }
        return listing;
    }

    private FoodListing find(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Listing not found"));
    }

    private void requireProvider(User user) {
        if (user.getRole() != Role.PROVIDER && user.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only food providers can manage listings");
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    @Transactional
    public FoodListing lock(Long id) {
        return listingRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Listing not found"));
    }
}
