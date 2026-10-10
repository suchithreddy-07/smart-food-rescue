package com.smartfoodrescue.repository;

import com.smartfoodrescue.domain.ListingStatus;
import com.smartfoodrescue.entity.FoodListing;
import com.smartfoodrescue.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FoodListingRepository extends JpaRepository<FoodListing, Long> {
    List<FoodListing> findByProviderOrderByCreatedAtDesc(User provider);

    List<FoodListing> findByStatusAndRemainingQuantityGreaterThanOrderByCreatedAtDesc(
            ListingStatus status, int remainingQuantity);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from FoodListing l where l.id = :id")
    Optional<FoodListing> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            select l from FoodListing l
            where l.status = com.smartfoodrescue.domain.ListingStatus.AVAILABLE
              and l.remainingQuantity > 0
              and (:city is null or lower(l.city) = lower(:city))
              and (:foodType is null or lower(l.foodType) like lower(concat('%', :foodType, '%')))
              and (:q is null or lower(l.title) like lower(concat('%', :q, '%'))
                   or lower(l.description) like lower(concat('%', :q, '%')))
            order by l.createdAt desc
            """)
    List<FoodListing> searchAvailable(@Param("q") String q,
                                      @Param("city") String city,
                                      @Param("foodType") String foodType);
}
