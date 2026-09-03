package com.hrm.backend.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualificationsDto {
    private List<WorkExperienceDto> workExperiences;
    private List<EducationDto> educations;
    private List<SkillDto> skills;
    private List<LanguageDto> languages;
    private List<LicenseDto> licenses;
}
