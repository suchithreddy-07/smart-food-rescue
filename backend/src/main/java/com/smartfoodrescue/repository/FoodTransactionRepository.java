package com.smartfoodrescue.repository;

import com.smartfoodrescue.entity.FoodTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FoodTransactionRepository extends JpaRepository<FoodTransaction, Long> {
    @Query("""
            select t from FoodTransaction t
            join fetch t.listing
            join fetch t.provider
            join fetch t.orphanage
            where t.provider.id = :userId or t.orphanage.id = :userId
            order by t.createdAt desc
            """)
    List<FoodTransaction> findForUser(@Param("userId") Long userId);

    @Query("""
            select t from FoodTransaction t
            join fetch t.listing
            join fetch t.provider
            join fetch t.orphanage
            order by t.createdAt desc
            """)
    List<FoodTransaction> findAllWithRelations();
}
