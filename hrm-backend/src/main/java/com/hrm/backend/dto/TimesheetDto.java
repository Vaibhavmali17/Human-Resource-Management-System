package com.hrm.backend.dto;

import com.hrm.backend.entity.TimesheetStatus;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimesheetDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate weekStartDate;
    private Double hoursWorked;
    private TimesheetStatus status;
    private String comments;
    private Long approvedById;
}
