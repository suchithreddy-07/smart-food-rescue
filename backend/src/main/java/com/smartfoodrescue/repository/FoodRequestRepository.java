package com.smartfoodrescue.repository;

import com.smartfoodrescue.domain.RequestStatus;
import com.smartfoodrescue.entity.FoodListing;
import com.smartfoodrescue.entity.FoodRequest;
import com.smartfoodrescue.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FoodRequestRepository extends JpaRepository<FoodRequest, Long> {
    List<FoodRequest> findByOrphanageOrderByCreatedAtDesc(User orphanage);
    List<FoodRequest> findByListingOrderByCreatedAtDesc(FoodListing listing);

    @Query("""
            select r from FoodRequest r
            join fetch r.listing l
            join fetch r.orphanage
            where l.provider.id = :providerId
            order by r.createdAt desc
            """)
    List<FoodRequest> findByProviderId(@Param("providerId") Long providerId);

    boolean existsByListingAndOrphanageAndStatus(FoodListing listing, User orphanage, RequestStatus status);
    long countByStatus(RequestStatus status);
}
