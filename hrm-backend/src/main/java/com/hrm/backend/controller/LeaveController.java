package com.hrm.backend.controller;

import com.hrm.backend.dto.*;
import com.hrm.backend.security.UserPrincipal;
import com.hrm.backend.service.LeaveService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping("/types")
    public ResponseEntity<List<LeaveTypeDto>> getAllLeaveTypes() {
        return ResponseEntity.ok(leaveService.getAllLeaveTypes());
    }

    @GetMapping("/balances/me")
    public ResponseEntity<List<LeaveBalanceDto>> getMyLeaveBalances(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(leaveService.getLeaveBalancesByUserId(currentUser.getId()));
    }

    @PostMapping("/apply")
    public ResponseEntity<LeaveRequestDto> applyLeave(@AuthenticationPrincipal UserPrincipal currentUser,
                                                     @RequestBody ApplyLeaveDto applyDto) {
        LeaveRequestDto request = leaveService.applyLeave(currentUser.getId(), applyDto);
        return new ResponseEntity<>(request, HttpStatus.CREATED);
    }

    @GetMapping("/my-history")
    public ResponseEntity<List<LeaveRequestDto>> getMyLeaveHistory(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(leaveService.getMyLeaveHistory(currentUser.getId()));
    }
}
