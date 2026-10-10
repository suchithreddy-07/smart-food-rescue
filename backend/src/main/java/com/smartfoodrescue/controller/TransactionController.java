package com.smartfoodrescue.controller;

import com.smartfoodrescue.dto.TransactionResponse;
import com.smartfoodrescue.security.SecurityUtils;
import com.smartfoodrescue.service.TransactionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public List<TransactionResponse> mine() {
        return transactionService.forUser(SecurityUtils.currentUser());
    }
}
