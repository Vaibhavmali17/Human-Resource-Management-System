package com.hrm.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyContactDto {
    private Long id;
    private String name;
    private String relationship;
    private String mobileNumber;
    private String homePhone;
}
