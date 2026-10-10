package com.smartfoodrescue.controller;

import com.smartfoodrescue.dto.AuthResponse;
import com.smartfoodrescue.dto.LoginRequest;
import com.smartfoodrescue.dto.RegisterRequest;
import com.smartfoodrescue.dto.UserResponse;
import com.smartfoodrescue.security.SecurityUtils;
import com.smartfoodrescue.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me() {
        return UserResponse.from(SecurityUtils.currentUser());
    }
}
