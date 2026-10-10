package com.smartfoodrescue.controller;

import com.smartfoodrescue.dto.ConfirmPickupDto;
import com.smartfoodrescue.dto.PickupResponse;
import com.smartfoodrescue.dto.SchedulePickupDto;
import com.smartfoodrescue.security.SecurityUtils;
import com.smartfoodrescue.service.PickupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pickups")
public class PickupController {
    private final PickupService pickupService;

    public PickupController(PickupService pickupService) {
        this.pickupService = pickupService;
    }

    @PostMapping("/requests/{requestId}")
    @ResponseStatus(HttpStatus.CREATED)
    public PickupResponse schedule(@PathVariable Long requestId, @Valid @RequestBody SchedulePickupDto dto) {
        return pickupService.schedule(SecurityUtils.currentUser(), requestId, dto);
    }

    @GetMapping
    public List<PickupResponse> mine() {
        return pickupService.mine(SecurityUtils.currentUser());
    }

    @GetMapping("/{id}")
    public PickupResponse get(@PathVariable Long id) {
        return pickupService.get(SecurityUtils.currentUser(), id);
    }

    @PostMapping("/confirm")
    public PickupResponse confirm(@Valid @RequestBody ConfirmPickupDto dto) {
        return pickupService.confirm(SecurityUtils.currentUser(), dto);
    }
}
