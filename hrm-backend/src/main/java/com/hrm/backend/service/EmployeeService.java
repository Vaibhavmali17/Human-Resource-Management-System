package com.hrm.backend.service;

import com.hrm.backend.dto.EmployeeDto;
import com.hrm.backend.dto.EmergencyContactDto;
import com.hrm.backend.dto.DependentDto;
import java.util.List;

public interface EmployeeService {
    EmployeeDto createEmployee(EmployeeDto employeeDto);
    EmployeeDto getEmployeeById(Long id);
    List<EmployeeDto> getAllEmployees();
    EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto);
    void deleteEmployee(Long id);
    EmployeeDto getEmployeeByUserId(Long userId);

    EmergencyContactDto addEmergencyContact(Long userId, EmergencyContactDto contactDto);
    EmergencyContactDto updateEmergencyContact(Long userId, Long contactId, EmergencyContactDto contactDto);
    void deleteEmergencyContact(Long userId, Long contactId);

    DependentDto addDependent(Long userId, DependentDto dependentDto);
    DependentDto updateDependent(Long userId, Long dependentId, DependentDto dependentDto);
    void deleteDependent(Long userId, Long dependentId);

    com.hrm.backend.dto.QualificationsDto getQualifications(Long userId);

    com.hrm.backend.dto.WorkExperienceDto addWorkExperience(Long userId, com.hrm.backend.dto.WorkExperienceDto dto);
    com.hrm.backend.dto.WorkExperienceDto updateWorkExperience(Long userId, Long id, com.hrm.backend.dto.WorkExperienceDto dto);
    void deleteWorkExperience(Long userId, Long id);

    com.hrm.backend.dto.EducationDto addEducation(Long userId, com.hrm.backend.dto.EducationDto dto);
    com.hrm.backend.dto.EducationDto updateEducation(Long userId, Long id, com.hrm.backend.dto.EducationDto dto);
    void deleteEducation(Long userId, Long id);

    com.hrm.backend.dto.SkillDto addSkill(Long userId, com.hrm.backend.dto.SkillDto dto);
    com.hrm.backend.dto.SkillDto updateSkill(Long userId, Long id, com.hrm.backend.dto.SkillDto dto);
    void deleteSkill(Long userId, Long id);

    com.hrm.backend.dto.LanguageDto addLanguage(Long userId, com.hrm.backend.dto.LanguageDto dto);
    com.hrm.backend.dto.LanguageDto updateLanguage(Long userId, Long id, com.hrm.backend.dto.LanguageDto dto);
    void deleteLanguage(Long userId, Long id);

    com.hrm.backend.dto.LicenseDto addLicense(Long userId, com.hrm.backend.dto.LicenseDto dto);
    com.hrm.backend.dto.LicenseDto updateLicense(Long userId, Long id, com.hrm.backend.dto.LicenseDto dto);
    void deleteLicense(Long userId, Long id);
}

