package com.smartfoodrescue.service;

import com.smartfoodrescue.domain.PickupStatus;
import com.smartfoodrescue.domain.RequestStatus;
import com.smartfoodrescue.domain.Role;
import com.smartfoodrescue.dto.ConfirmPickupDto;
import com.smartfoodrescue.dto.PickupResponse;
import com.smartfoodrescue.dto.SchedulePickupDto;
import com.smartfoodrescue.entity.FoodRequest;
import com.smartfoodrescue.entity.FoodTransaction;
import com.smartfoodrescue.entity.Pickup;
import com.smartfoodrescue.entity.User;
import com.smartfoodrescue.exception.ApiException;
import com.smartfoodrescue.repository.FoodRequestRepository;
import com.smartfoodrescue.repository.FoodTransactionRepository;
import com.smartfoodrescue.repository.PickupRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class PickupService {
    private final PickupRepository pickupRepository;
    private final FoodRequestRepository requestRepository;
    private final FoodTransactionRepository transactionRepository;

    public PickupService(PickupRepository pickupRepository,
                         FoodRequestRepository requestRepository,
                         FoodTransactionRepository transactionRepository) {
        this.pickupRepository = pickupRepository;
        this.requestRepository = requestRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public PickupResponse schedule(User user, Long requestId, SchedulePickupDto dto) {
        FoodRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Request not found"));
        if (request.getStatus() != RequestStatus.ACCEPTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Pickup can only be scheduled for accepted requests");
        }
        boolean involved = request.getOrphanage().getId().equals(user.getId())
                || request.getListing().getProvider().getId().equals(user.getId())
                || user.getRole() == Role.ADMIN;
        if (!involved) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed to schedule this pickup");
        }
        if (pickupRepository.findByRequest(request).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Pickup already scheduled");
        }
        Pickup pickup = new Pickup();
        pickup.setRequest(request);
        pickup.setScheduledAt(dto.getScheduledAt());
        pickup.setPickupLocation(dto.getPickupLocation());
        pickup.setQrToken(UUID.randomUUID().toString());
        pickup.setStatus(PickupStatus.SCHEDULED);
        return PickupResponse.from(pickupRepository.save(pickup), true);
    }

    public List<PickupResponse> mine(User user) {
        boolean includeQr = true;
        return pickupRepository.findForUser(user.getId())
                .stream().map(p -> PickupResponse.from(p, includeQr)).toList();
    }

    public PickupResponse get(User user, Long id) {
        Pickup pickup = pickupRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pickup not found"));
        assertParticipant(user, pickup);
        return PickupResponse.from(pickup, true);
    }

    @Transactional
    public PickupResponse confirm(User user, ConfirmPickupDto dto) {
        Pickup pickup = pickupRepository.findByQrToken(dto.getQrToken().trim())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invalid QR token"));
        assertParticipant(user, pickup);
        if (pickup.getStatus() == PickupStatus.COMPLETED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This pickup is already completed");
        }
        pickup.setStatus(PickupStatus.COMPLETED);
        pickup.setCollectedAt(Instant.now());
        pickupRepository.save(pickup);

        FoodTransaction transaction = new FoodTransaction();
        transaction.setPickup(pickup);
        transaction.setListing(pickup.getRequest().getListing());
        transaction.setProvider(pickup.getRequest().getListing().getProvider());
        transaction.setOrphanage(pickup.getRequest().getOrphanage());
        transaction.setQuantity(pickup.getRequest().getRequestedQuantity());
        transaction.setUnit(pickup.getRequest().getListing().getUnit());
        transaction.setType("COLLECTION");
        transactionRepository.save(transaction);
        return PickupResponse.from(pickup, true);
    }

    private void assertParticipant(User user, Pickup pickup) {
        Long userId = user.getId();
        boolean ok = pickup.getRequest().getOrphanage().getId().equals(userId)
                || pickup.getRequest().getListing().getProvider().getId().equals(userId)
                || user.getRole() == Role.ADMIN;
        if (!ok) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed");
        }
    }
}
