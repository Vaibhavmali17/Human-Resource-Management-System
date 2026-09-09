package com.hrm.backend.controller;

import com.hrm.backend.dto.*;
import com.hrm.backend.service.LeaveService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/leaves")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLeaveController {

    private final LeaveService leaveService;

    public AdminLeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LeaveRequestDto>> getPendingLeaveRequests() {
        return ResponseEntity.ok(leaveService.getPendingLeaveRequests());
    }

    @GetMapping("/all")
    public ResponseEntity<List<LeaveRequestDto>> getAllLeaveRequests() {
        return ResponseEntity.ok(leaveService.getAllLeaveRequests());
    }

    @RequestMapping(value = "/{id}/action", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<LeaveRequestDto> processLeaveAction(@PathVariable Long id,
                                                             @RequestBody LeaveActionDto actionDto) {
        LeaveRequestDto updated = leaveService.processLeaveAction(id, actionDto);
        return ResponseEntity.ok(updated);
    }
}
