package com.hrm.backend.service;

import com.hrm.backend.dto.EmployeeDto;
import com.hrm.backend.dto.EmergencyContactDto;
import com.hrm.backend.dto.DependentDto;
import com.hrm.backend.entity.Employee;
import com.hrm.backend.entity.EmergencyContact;
import com.hrm.backend.entity.Dependent;
import com.hrm.backend.entity.User;
import com.hrm.backend.exception.ResourceNotFoundException;
import com.hrm.backend.repository.EmployeeRepository;
import com.hrm.backend.repository.UserRepository;
import com.hrm.backend.repository.EmergencyContactRepository;
import com.hrm.backend.repository.DependentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final DependentRepository dependentRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               UserRepository userRepository,
                               EmergencyContactRepository emergencyContactRepository,
                               DependentRepository dependentRepository) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.emergencyContactRepository = emergencyContactRepository;
        this.dependentRepository = dependentRepository;
    }

    @Override
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        Employee employee = mapToEntity(employeeDto);
        Employee savedEmployee = employeeRepository.save(employee);
        return mapToDto(savedEmployee);
    }

    @Override
    public EmployeeDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return mapToDto(employee);
    }

    @Override
    public List<EmployeeDto> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        return employees.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        employee.setFirstName(employeeDto.getFirstName());
        employee.setLastName(employeeDto.getLastName());
        employee.setEmail(employeeDto.getEmail());
        employee.setPhoneNumber(employeeDto.getPhoneNumber());
        employee.setDepartment(employeeDto.getDepartment());
        employee.setDesignation(employeeDto.getDesignation());
        employee.setDateOfJoining(employeeDto.getDateOfJoining());
        employee.setSalary(employeeDto.getSalary());

        // Day 3 fields
        employee.setGender(employeeDto.getGender());
        employee.setMaritalStatus(employeeDto.getMaritalStatus());
        employee.setNationality(employeeDto.getNationality());
        employee.setDateOfBirth(employeeDto.getDateOfBirth());
        employee.setStreetAddress1(employeeDto.getStreetAddress1());
        employee.setStreetAddress2(employeeDto.getStreetAddress2());
        employee.setCity(employeeDto.getCity());
        employee.setState(employeeDto.getState());
        employee.setPostalCode(employeeDto.getPostalCode());
        employee.setCountry(employeeDto.getCountry());
        employee.setMobileNumber(employeeDto.getMobileNumber());
        employee.setPersonalEmail(employeeDto.getPersonalEmail());
        employee.setProfilePicture(employeeDto.getProfilePicture());

        if (employeeDto.getUserId() != null) {
            User user = userRepository.findById(employeeDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", employeeDto.getUserId()));
            employee.setUser(user);
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToDto(updatedEmployee);
    }

    @Override
    public EmergencyContactDto addEmergencyContact(Long userId, EmergencyContactDto contactDto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        EmergencyContact contact = EmergencyContact.builder()
                .name(contactDto.getName())
                .relationship(contactDto.getRelationship())
                .mobileNumber(contactDto.getMobileNumber())
                .homePhone(contactDto.getHomePhone())
                .employee(employee)
                .build();

        EmergencyContact saved = emergencyContactRepository.save(contact);
        return EmergencyContactDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .relationship(saved.getRelationship())
                .mobileNumber(saved.getMobileNumber())
                .homePhone(saved.getHomePhone())
                .build();
    }

    @Override
    public void deleteEmergencyContact(Long userId, Long contactId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        EmergencyContact contact = emergencyContactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("EmergencyContact", "id", contactId));

        if (!contact.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to delete this contact");
        }

        emergencyContactRepository.delete(contact);
    }

    @Override
    public DependentDto addDependent(Long userId, DependentDto dependentDto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        Dependent dependent = Dependent.builder()
                .name(dependentDto.getName())
                .relationship(dependentDto.getRelationship())
                .dateOfBirth(dependentDto.getDateOfBirth())
                .employee(employee)
                .build();

        Dependent saved = dependentRepository.save(dependent);
        return DependentDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .relationship(saved.getRelationship())
                .dateOfBirth(saved.getDateOfBirth())
                .build();
    }

    @Override
    public void deleteDependent(Long userId, Long dependentId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        Dependent dependent = dependentRepository.findById(dependentId)
                .orElseThrow(() -> new ResourceNotFoundException("Dependent", "id", dependentId));

        if (!dependent.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to delete this dependent");
        }

        dependentRepository.delete(dependent);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employeeRepository.delete(employee);
    }

    @Override
    public EmployeeDto getEmployeeByUserId(Long userId) {
        return employeeRepository.findByUserId(userId)
                .map(this::mapToDto)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    Employee employee = new Employee();
                    employee.setUser(user);
                    employee.setFirstName(user.getUsername());
                    employee.setLastName("Employee");
                    employee.setEmail(user.getUsername() + "@company.com");
                    employee.setDepartment("General");
                    employee.setDesignation("Associate");
                    employee.setPhoneNumber("");
                    employee.setDateOfJoining(java.time.LocalDate.now());
                    employee.setSalary(0.0);
                    employee.setAddress("");
                    Employee saved = employeeRepository.save(employee);
                    return mapToDto(saved);
                });
    }

    private Employee mapToEntity(EmployeeDto dto) {
        Employee employee = new Employee();
        employee.setId(dto.getId());
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());
        employee.setPhoneNumber(dto.getPhoneNumber());
        employee.setDepartment(dto.getDepartment());
        employee.setDesignation(dto.getDesignation());
        employee.setDateOfJoining(dto.getDateOfJoining());
        employee.setSalary(dto.getSalary());

        // Day 3 fields
        employee.setGender(dto.getGender());
        employee.setMaritalStatus(dto.getMaritalStatus());
        employee.setNationality(dto.getNationality());
        employee.setDateOfBirth(dto.getDateOfBirth());
        employee.setStreetAddress1(dto.getStreetAddress1());
        employee.setStreetAddress2(dto.getStreetAddress2());
        employee.setCity(dto.getCity());
        employee.setState(dto.getState());
        employee.setPostalCode(dto.getPostalCode());
        employee.setCountry(dto.getCountry());
        employee.setMobileNumber(dto.getMobileNumber());
        employee.setPersonalEmail(dto.getPersonalEmail());
        employee.setProfilePicture(dto.getProfilePicture());

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getUserId()));
            employee.setUser(user);
        }
        return employee;
    }

    private EmployeeDto mapToDto(Employee employee) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(employee.getId());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setPhoneNumber(employee.getPhoneNumber());
        dto.setDepartment(employee.getDepartment());
        dto.setDesignation(employee.getDesignation());
        dto.setDateOfJoining(employee.getDateOfJoining());
        dto.setSalary(employee.getSalary());

        // Day 3 fields
        dto.setGender(employee.getGender());
        dto.setMaritalStatus(employee.getMaritalStatus());
        dto.setNationality(employee.getNationality());
        dto.setDateOfBirth(employee.getDateOfBirth());
        dto.setStreetAddress1(employee.getStreetAddress1());
        dto.setStreetAddress2(employee.getStreetAddress2());
        dto.setCity(employee.getCity());
        dto.setState(employee.getState());
        dto.setPostalCode(employee.getPostalCode());
        dto.setCountry(employee.getCountry());
        dto.setMobileNumber(employee.getMobileNumber());
        dto.setPersonalEmail(employee.getPersonalEmail());
        dto.setProfilePicture(employee.getProfilePicture());

        if (employee.getUser() != null) {
            dto.setUserId(employee.getUser().getId());
        }

        if (employee.getEmergencyContacts() != null) {
            dto.setEmergencyContacts(employee.getEmergencyContacts().stream()
                .map(ec -> new EmergencyContactDto(ec.getId(), ec.getName(), ec.getRelationship(), ec.getMobileNumber(), ec.getHomePhone()))
                .collect(Collectors.toList()));
        } else {
            dto.setEmergencyContacts(new java.util.ArrayList<>());
        }

        if (employee.getDependents() != null) {
            dto.setDependents(employee.getDependents().stream()
                .map(d -> new DependentDto(d.getId(), d.getName(), d.getRelationship(), d.getDateOfBirth()))
                .collect(Collectors.toList()));
        } else {
            dto.setDependents(new java.util.ArrayList<>());
        }

        return dto;
    }
}
