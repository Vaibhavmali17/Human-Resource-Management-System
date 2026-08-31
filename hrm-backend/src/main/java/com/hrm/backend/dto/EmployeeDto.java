package com.hrm.backend.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String department;
    private String designation;
    private LocalDate dateOfJoining;
    private Double salary;
    private Long userId;

    private String gender;
    private String maritalStatus;
    private String nationality;
    private LocalDate dateOfBirth;
    private String streetAddress1;
    private String streetAddress2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String mobileNumber;
    private String personalEmail;
    private String profilePicture;

    private java.util.List<EmergencyContactDto> emergencyContacts;
    private java.util.List<DependentDto> dependents;
}
