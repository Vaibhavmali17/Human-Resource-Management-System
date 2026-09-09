package com.hrm.backend.service;

import com.hrm.backend.dto.*;
import java.util.List;

public interface LeaveService {
    List<LeaveTypeDto> getAllLeaveTypes();
    List<LeaveBalanceDto> getLeaveBalancesByUserId(Long userId);
    LeaveRequestDto applyLeave(Long userId, ApplyLeaveDto applyDto);
    List<LeaveRequestDto> getMyLeaveHistory(Long userId);
    List<LeaveRequestDto> getPendingLeaveRequests();
    List<LeaveRequestDto> getAllLeaveRequests();
    LeaveRequestDto processLeaveAction(Long requestId, LeaveActionDto actionDto);
}
