package com.hrm.backend.service;

import com.hrm.backend.dto.*;
import com.hrm.backend.entity.*;
import com.hrm.backend.exception.ResourceNotFoundException;
import com.hrm.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final DependentRepository dependentRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final EducationRepository educationRepository;
    private final SkillRepository skillRepository;
    private final LanguageRepository languageRepository;
    private final LicenseRepository licenseRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               UserRepository userRepository,
                               EmergencyContactRepository emergencyContactRepository,
                               DependentRepository dependentRepository,
                               WorkExperienceRepository workExperienceRepository,
                               EducationRepository educationRepository,
                               SkillRepository skillRepository,
                               LanguageRepository languageRepository,
                               LicenseRepository licenseRepository) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.emergencyContactRepository = emergencyContactRepository;
        this.dependentRepository = dependentRepository;
        this.workExperienceRepository = workExperienceRepository;
        this.educationRepository = educationRepository;
        this.skillRepository = skillRepository;
        this.languageRepository = languageRepository;
        this.licenseRepository = licenseRepository;
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
        employee.setEmployeeCode(employeeDto.getEmployeeCode());

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
    public EmergencyContactDto updateEmergencyContact(Long userId, Long contactId, EmergencyContactDto contactDto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        EmergencyContact contact = emergencyContactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("EmergencyContact", "id", contactId));

        if (!contact.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to update this contact");
        }

        contact.setName(contactDto.getName());
        contact.setRelationship(contactDto.getRelationship());
        contact.setMobileNumber(contactDto.getMobileNumber());
        contact.setHomePhone(contactDto.getHomePhone());

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
    public DependentDto updateDependent(Long userId, Long dependentId, DependentDto dependentDto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        Dependent dependent = dependentRepository.findById(dependentId)
                .orElseThrow(() -> new ResourceNotFoundException("Dependent", "id", dependentId));

        if (!dependent.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to update this dependent");
        }

        dependent.setName(dependentDto.getName());
        dependent.setRelationship(dependentDto.getRelationship());
        dependent.setDateOfBirth(dependentDto.getDateOfBirth());

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

    private Employee getOrCreateEmployeeEntityByUserId(Long userId) {
        return employeeRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    Employee employee = new Employee();
                    employee.setUser(user);
                    employee.setFirstName(user.getFirstName() != null ? user.getFirstName() : user.getUsername());
                    employee.setLastName(user.getLastName() != null ? user.getLastName() : "");
                    employee.setEmail(user.getEmail() != null ? user.getEmail() : user.getUsername() + "@company.com");
                    employee.setDepartment("General");
                    employee.setDesignation("Employee");
                    employee.setDateOfJoining(java.time.LocalDate.now());
                    employee.setSalary(0.0);
                    employee.setAddress("");
                    employee.setEmployeeCode("EMP-" + String.format("%04d", user.getId()));
                    return employeeRepository.save(employee);
                });
    }

    @Override
    public EmployeeDto getEmployeeByUserId(Long userId) {
        return mapToDto(getOrCreateEmployeeEntityByUserId(userId));
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
        employee.setEmployeeCode(dto.getEmployeeCode());

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
        dto.setEmployeeCode(employee.getEmployeeCode());

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

    @Override
    public QualificationsDto getQualifications(Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                    Employee newEmp = new Employee();
                    newEmp.setUser(user);
                    newEmp.setFirstName(user.getFirstName() != null && !user.getFirstName().isEmpty() ? user.getFirstName() : user.getUsername());
                    newEmp.setLastName(user.getLastName() != null ? user.getLastName() : "");
                    newEmp.setEmail(user.getEmail() != null && !user.getEmail().isEmpty() ? user.getEmail() : user.getUsername() + "@company.com");
                    newEmp.setDepartment("General");
                    newEmp.setDesignation("Employee");
                    newEmp.setDateOfJoining(java.time.LocalDate.now());
                    newEmp.setSalary(0.0);
                    newEmp.setAddress("");
                    newEmp.setEmployeeCode("EMP-" + String.format("%04d", user.getId()));
                    return employeeRepository.save(newEmp);
                });

        List<WorkExperienceDto> workExpDtos = workExperienceRepository.findByEmployeeId(employee.getId()).stream()
                .map(w -> new WorkExperienceDto(w.getId(), w.getCompany(), w.getJobTitle(), w.getFromDate(), w.getToDate(), w.getComment()))
                .collect(Collectors.toList());

        List<EducationDto> eduDtos = educationRepository.findByEmployeeId(employee.getId()).stream()
                .map(e -> new EducationDto(e.getId(), e.getLevel(), e.getInstitute(), e.getMajor(), e.getYear(), e.getGpaScore(), e.getStartDate(), e.getEndDate()))
                .collect(Collectors.toList());

        List<SkillDto> skillDtos = skillRepository.findByEmployeeId(employee.getId()).stream()
                .map(s -> new SkillDto(s.getId(), s.getSkillName(), s.getYearsOfExperience(), s.getComments()))
                .collect(Collectors.toList());

        List<LanguageDto> langDtos = languageRepository.findByEmployeeId(employee.getId()).stream()
                .map(l -> new LanguageDto(l.getId(), l.getLanguageName(), l.getFluency(), l.getCompetency(), l.getComments()))
                .collect(Collectors.toList());

        List<LicenseDto> licDtos = licenseRepository.findByEmployeeId(employee.getId()).stream()
                .map(lic -> new LicenseDto(lic.getId(), lic.getLicenseType(), lic.getLicenseNumber(), lic.getIssuedDate(), lic.getExpiryDate()))
                .collect(Collectors.toList());

        return QualificationsDto.builder()
                .workExperiences(workExpDtos)
                .educations(eduDtos)
                .skills(skillDtos)
                .languages(langDtos)
                .licenses(licDtos)
                .build();
    }

    @Override
    public WorkExperienceDto addWorkExperience(Long userId, WorkExperienceDto dto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        WorkExperience exp = WorkExperience.builder()
                .company(dto.getCompany())
                .jobTitle(dto.getJobTitle())
                .fromDate(dto.getFromDate())
                .toDate(dto.getToDate())
                .comment(dto.getComment())
                .employee(employee)
                .build();

        WorkExperience saved = workExperienceRepository.save(exp);
        return new WorkExperienceDto(saved.getId(), saved.getCompany(), saved.getJobTitle(), saved.getFromDate(), saved.getToDate(), saved.getComment());
    }

    @Override
    public WorkExperienceDto updateWorkExperience(Long userId, Long id, WorkExperienceDto dto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        WorkExperience exp = workExperienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkExperience", "id", id));

        if (!exp.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to update this work experience record");
        }

        exp.setCompany(dto.getCompany());
        exp.setJobTitle(dto.getJobTitle());
        exp.setFromDate(dto.getFromDate());
        exp.setToDate(dto.getToDate());
        exp.setComment(dto.getComment());

        WorkExperience saved = workExperienceRepository.save(exp);
        return new WorkExperienceDto(saved.getId(), saved.getCompany(), saved.getJobTitle(), saved.getFromDate(), saved.getToDate(), saved.getComment());
    }

    @Override
    public void deleteWorkExperience(Long userId, Long id) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        WorkExperience exp = workExperienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkExperience", "id", id));

        if (!exp.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to delete this work experience record");
        }

        workExperienceRepository.delete(exp);
    }

    @Override
    public EducationDto addEducation(Long userId, EducationDto dto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        Education edu = Education.builder()
                .level(dto.getLevel())
                .institute(dto.getInstitute())
                .major(dto.getMajor())
                .year(dto.getYear())
                .gpaScore(dto.getGpaScore())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .employee(employee)
                .build();

        Education saved = educationRepository.save(edu);
        return new EducationDto(saved.getId(), saved.getLevel(), saved.getInstitute(), saved.getMajor(), saved.getYear(), saved.getGpaScore(), saved.getStartDate(), saved.getEndDate());
    }

    @Override
    public EducationDto updateEducation(Long userId, Long id, EducationDto dto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        Education edu = educationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education", "id", id));

        if (!edu.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to update this education record");
        }

        edu.setLevel(dto.getLevel());
        edu.setInstitute(dto.getInstitute());
        edu.setMajor(dto.getMajor());
        edu.setYear(dto.getYear());
        edu.setGpaScore(dto.getGpaScore());
        edu.setStartDate(dto.getStartDate());
        edu.setEndDate(dto.getEndDate());

        Education saved = educationRepository.save(edu);
        return new EducationDto(saved.getId(), saved.getLevel(), saved.getInstitute(), saved.getMajor(), saved.getYear(), saved.getGpaScore(), saved.getStartDate(), saved.getEndDate());
    }

    @Override
    public void deleteEducation(Long userId, Long id) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        Education edu = educationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education", "id", id));

        if (!edu.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to delete this education record");
        }

        educationRepository.delete(edu);
    }

    @Override
    public SkillDto addSkill(Long userId, SkillDto dto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        Skill skill = Skill.builder()
                .skillName(dto.getSkillName())
                .yearsOfExperience(dto.getYearsOfExperience())
                .comments(dto.getComments())
                .employee(employee)
                .build();

        Skill saved = skillRepository.save(skill);
        return new SkillDto(saved.getId(), saved.getSkillName(), saved.getYearsOfExperience(), saved.getComments());
    }

    @Override
    public SkillDto updateSkill(Long userId, Long id, SkillDto dto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", id));

        if (!skill.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to update this skill record");
        }

        skill.setSkillName(dto.getSkillName());
        skill.setYearsOfExperience(dto.getYearsOfExperience());
        skill.setComments(dto.getComments());

        Skill saved = skillRepository.save(skill);
        return new SkillDto(saved.getId(), saved.getSkillName(), saved.getYearsOfExperience(), saved.getComments());
    }

    @Override
    public void deleteSkill(Long userId, Long id) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", id));

        if (!skill.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to delete this skill record");
        }

        skillRepository.delete(skill);
    }

    @Override
    public LanguageDto addLanguage(Long userId, LanguageDto dto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        Language lang = Language.builder()
                .languageName(dto.getLanguageName())
                .fluency(dto.getFluency())
                .competency(dto.getCompetency())
                .comments(dto.getComments())
                .employee(employee)
                .build();

        Language saved = languageRepository.save(lang);
        return new LanguageDto(saved.getId(), saved.getLanguageName(), saved.getFluency(), saved.getCompetency(), saved.getComments());
    }

    @Override
    public LanguageDto updateLanguage(Long userId, Long id, LanguageDto dto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        Language lang = languageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Language", "id", id));

        if (!lang.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to update this language record");
        }

        lang.setLanguageName(dto.getLanguageName());
        lang.setFluency(dto.getFluency());
        lang.setCompetency(dto.getCompetency());
        lang.setComments(dto.getComments());

        Language saved = languageRepository.save(lang);
        return new LanguageDto(saved.getId(), saved.getLanguageName(), saved.getFluency(), saved.getCompetency(), saved.getComments());
    }

    @Override
    public void deleteLanguage(Long userId, Long id) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        Language lang = languageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Language", "id", id));

        if (!lang.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to delete this language record");
        }

        languageRepository.delete(lang);
    }

    @Override
    public LicenseDto addLicense(Long userId, LicenseDto dto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        License lic = License.builder()
                .licenseType(dto.getLicenseType())
                .licenseNumber(dto.getLicenseNumber())
                .issuedDate(dto.getIssuedDate())
                .expiryDate(dto.getExpiryDate())
                .employee(employee)
                .build();

        License saved = licenseRepository.save(lic);
        return new LicenseDto(saved.getId(), saved.getLicenseType(), saved.getLicenseNumber(), saved.getIssuedDate(), saved.getExpiryDate());
    }

    @Override
    public LicenseDto updateLicense(Long userId, Long id, LicenseDto dto) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        License lic = licenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("License", "id", id));

        if (!lic.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to update this license record");
        }

        lic.setLicenseType(dto.getLicenseType());
        lic.setLicenseNumber(dto.getLicenseNumber());
        lic.setIssuedDate(dto.getIssuedDate());
        lic.setExpiryDate(dto.getExpiryDate());

        License saved = licenseRepository.save(lic);
        return new LicenseDto(saved.getId(), saved.getLicenseType(), saved.getLicenseNumber(), saved.getIssuedDate(), saved.getExpiryDate());
    }

    @Override
    public void deleteLicense(Long userId, Long id) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));

        License lic = licenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("License", "id", id));

        if (!lic.getEmployee().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Unauthorized to delete this license record");
        }

        licenseRepository.delete(lic);
    }
}
