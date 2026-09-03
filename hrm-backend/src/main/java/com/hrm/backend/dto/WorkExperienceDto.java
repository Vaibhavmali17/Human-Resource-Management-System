package com.hrm.backend.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkExperienceDto {
    private Long id;
    private String company;
    private String jobTitle;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String comment;
}
