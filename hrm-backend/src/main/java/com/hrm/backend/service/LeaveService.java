package com.hrm.backend.service;

import com.hrm.backend.dto.LeaveRequestDto;
import java.util.List;

public interface LeaveService {
    LeaveRequestDto applyLeave(LeaveRequestDto leaveRequestDto);
    List<LeaveRequestDto> getLeavesByEmployee(Long employeeId);
    List<LeaveRequestDto> getAllLeaves();
    LeaveRequestDto updateLeaveStatus(Long leaveId, String status, Long approvedById);
}
