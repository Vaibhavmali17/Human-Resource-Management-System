package com.hrm.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LanguageDto {
    private Long id;
    private String languageName;
    private String fluency;
    private String competency;
    private String comments;
}
