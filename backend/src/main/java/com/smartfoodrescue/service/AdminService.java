package com.smartfoodrescue.service;

import com.smartfoodrescue.domain.RequestStatus;
import com.smartfoodrescue.domain.Role;
import com.smartfoodrescue.dto.DashboardStatsResponse;
import com.smartfoodrescue.dto.RequestResponse;
import com.smartfoodrescue.dto.UserResponse;
import com.smartfoodrescue.entity.FoodTransaction;
import com.smartfoodrescue.entity.User;
import com.smartfoodrescue.exception.ApiException;
import com.smartfoodrescue.repository.FoodListingRepository;
import com.smartfoodrescue.repository.FoodRequestRepository;
import com.smartfoodrescue.repository.FoodTransactionRepository;
import com.smartfoodrescue.repository.PickupRepository;
import com.smartfoodrescue.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final FoodListingRepository listingRepository;
    private final FoodRequestRepository requestRepository;
    private final PickupRepository pickupRepository;
    private final FoodTransactionRepository transactionRepository;

    public AdminService(UserRepository userRepository,
                        FoodListingRepository listingRepository,
                        FoodRequestRepository requestRepository,
                        PickupRepository pickupRepository,
                        FoodTransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.requestRepository = requestRepository;
        this.pickupRepository = pickupRepository;
        this.transactionRepository = transactionRepository;
    }

    public DashboardStatsResponse stats() {
        long meals = transactionRepository.findAll().stream().mapToLong(FoodTransaction::getQuantity).sum();
        return new DashboardStatsResponse(
                userRepository.countByRole(Role.PROVIDER),
                userRepository.countByRole(Role.ORPHANAGE),
                listingRepository.count(),
                requestRepository.countByStatus(RequestStatus.PENDING),
                pickupRepository.count(),
                meals
        );
    }

    public List<UserResponse> users() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    public List<RequestResponse> requests() {
        return requestRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(RequestResponse::from).toList();
    }

    public UserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        user.setEnabled(!user.isEnabled());
        return UserResponse.from(userRepository.save(user));
    }
}
