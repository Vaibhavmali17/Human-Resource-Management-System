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
    void deleteEmergencyContact(Long userId, Long contactId);
    DependentDto addDependent(Long userId, DependentDto dependentDto);
    void deleteDependent(Long userId, Long dependentId);
}
