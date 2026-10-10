package com.smartfoodrescue.service;

import com.smartfoodrescue.domain.Role;
import com.smartfoodrescue.dto.TransactionResponse;
import com.smartfoodrescue.entity.User;
import com.smartfoodrescue.repository.FoodTransactionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TransactionService {
    private final FoodTransactionRepository transactionRepository;

    public TransactionService(FoodTransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<TransactionResponse> forUser(User user) {
        if (user.getRole() == Role.ADMIN) {
            return transactionRepository.findAllWithRelations()
                    .stream().map(TransactionResponse::from).toList();
        }
        return transactionRepository.findForUser(user.getId())
                .stream().map(TransactionResponse::from).toList();
    }
}
