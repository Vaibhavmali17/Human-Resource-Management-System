package com.hrm.backend.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LicenseDto {
    private Long id;
    private String licenseType;
    private String licenseNumber;
    private LocalDate issuedDate;
    private LocalDate expiryDate;
}
