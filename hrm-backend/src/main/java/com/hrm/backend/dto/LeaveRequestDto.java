package com.hrm.backend.dto;

import com.hrm.backend.entity.LeaveStatus;
import com.hrm.backend.entity.LeaveType;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequestDto {
    private Long id;
    private Long employeeId;
    private LocalDate startDate;
    private LocalDate endDate;
    private LeaveType leaveType;
    private LeaveStatus status;
    private String reason;
    private Long approvedById;
}
