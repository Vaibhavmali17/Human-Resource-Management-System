package com.hrm.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    private String username;
    private String password;
    private String email;
    private String role;

    // Onboarding fields
    private String firstName;
    private String lastName;
    private String phone;
    private String department;
    private String designation;
    private String dateOfJoining;
    private String address;
    private Double salary;
}
