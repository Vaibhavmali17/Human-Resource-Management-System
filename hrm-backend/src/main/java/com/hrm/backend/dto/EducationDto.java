package com.hrm.backend.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationDto {
    private Long id;
    private String level;
    private String institute;
    private String major;
    private Integer year;
    private Double gpaScore;
    private LocalDate startDate;
    private LocalDate endDate;
}
