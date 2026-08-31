package com.hrm.backend.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DependentDto {
    private Long id;
    private String name;
    private String relationship;
    private LocalDate dateOfBirth;
}
