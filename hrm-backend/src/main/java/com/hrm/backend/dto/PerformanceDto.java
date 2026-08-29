package com.hrm.backend.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceDto {
    private Long id;
    private Long employeeId;
    private String reviewPeriod;
    private Integer rating;
    private String feedback;
    private Long reviewerId;
    private LocalDate reviewDate;
}
