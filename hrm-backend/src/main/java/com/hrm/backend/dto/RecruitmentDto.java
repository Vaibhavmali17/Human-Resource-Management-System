package com.hrm.backend.dto;

import com.hrm.backend.entity.ApplicationStatus;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruitmentDto {
    private Long id;
    private String candidateName;
    private String candidateEmail;
    private String jobTitle;
    private LocalDate applicationDate;
    private ApplicationStatus status;
    private String resumeUrl;
    private String feedback;
}
