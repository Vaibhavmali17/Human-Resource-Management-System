package com.hrm.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrOnboardRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private String designation;
}
