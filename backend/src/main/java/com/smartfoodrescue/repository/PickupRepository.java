package com.smartfoodrescue.repository;

import com.smartfoodrescue.entity.FoodRequest;
import com.smartfoodrescue.entity.Pickup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PickupRepository extends JpaRepository<Pickup, Long> {
    Optional<Pickup> findByRequest(FoodRequest request);
    Optional<Pickup> findByQrToken(String qrToken);

    @Query("""
            select p from Pickup p
            join fetch p.request r
            join fetch r.listing l
            join fetch r.orphanage
            where l.provider.id = :userId or r.orphanage.id = :userId
            order by p.scheduledAt desc
            """)
    List<Pickup> findForUser(@Param("userId") Long userId);
}
