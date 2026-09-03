package com.hrm.backend.controller;

import com.hrm.backend.dto.*;
import com.hrm.backend.security.UserPrincipal;
import com.hrm.backend.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final LeaveService leaveService;
    private final TimesheetService timesheetService;
    private final PerformanceService performanceService;

    public EmployeeController(EmployeeService employeeService,
                              LeaveService leaveService,
                              TimesheetService timesheetService,
                              PerformanceService performanceService) {
        this.employeeService = employeeService;
        this.leaveService = leaveService;
        this.timesheetService = timesheetService;
        this.performanceService = performanceService;
    }

    // My Info View & Update
    @GetMapping("/profile")
    public ResponseEntity<EmployeeDto> getProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(employeeService.getEmployeeByUserId(currentUser.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<EmployeeDto> updateProfile(@AuthenticationPrincipal UserPrincipal currentUser,
                                                     @RequestBody EmployeeDto employeeDto) {
        EmployeeDto existingEmployee = employeeService.getEmployeeByUserId(currentUser.getId());
        existingEmployee.setFirstName(employeeDto.getFirstName());
        existingEmployee.setLastName(employeeDto.getLastName());
        existingEmployee.setPhoneNumber(employeeDto.getPhoneNumber());
        existingEmployee.setGender(employeeDto.getGender());
        existingEmployee.setMaritalStatus(employeeDto.getMaritalStatus());
        existingEmployee.setNationality(employeeDto.getNationality());
        existingEmployee.setStreetAddress1(employeeDto.getStreetAddress1());
        existingEmployee.setStreetAddress2(employeeDto.getStreetAddress2());
        existingEmployee.setCity(employeeDto.getCity());
        existingEmployee.setState(employeeDto.getState());
        existingEmployee.setPostalCode(employeeDto.getPostalCode());
        existingEmployee.setCountry(employeeDto.getCountry());
        existingEmployee.setMobileNumber(employeeDto.getMobileNumber());
        existingEmployee.setPersonalEmail(employeeDto.getPersonalEmail());
        existingEmployee.setProfilePicture(employeeDto.getProfilePicture());

        EmployeeDto updated = employeeService.updateEmployee(existingEmployee.getId(), existingEmployee);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/me")
    public ResponseEntity<EmployeeDto> getMyProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(employeeService.getEmployeeByUserId(currentUser.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<EmployeeDto> updateMyProfile(@AuthenticationPrincipal UserPrincipal currentUser,
                                                       @RequestBody EmployeeDto employeeDto) {
        return updateProfile(currentUser, employeeDto);
    }

    @PostMapping("/me/emergency-contacts")
    public ResponseEntity<EmergencyContactDto> addEmergencyContact(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                   @RequestBody EmergencyContactDto contactDto) {
        return new ResponseEntity<>(employeeService.addEmergencyContact(currentUser.getId(), contactDto), HttpStatus.CREATED);
    }

    @RequestMapping(value = "/me/emergency-contacts/{id}", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<EmergencyContactDto> updateEmergencyContact(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                      @PathVariable Long id,
                                                                      @RequestBody EmergencyContactDto contactDto) {
        return ResponseEntity.ok(employeeService.updateEmergencyContact(currentUser.getId(), id, contactDto));
    }

    @DeleteMapping("/me/emergency-contacts/{id}")
    public ResponseEntity<Void> deleteEmergencyContact(@AuthenticationPrincipal UserPrincipal currentUser,
                                                       @PathVariable Long id) {
        employeeService.deleteEmergencyContact(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/dependents")
    public ResponseEntity<DependentDto> addDependent(@AuthenticationPrincipal UserPrincipal currentUser,
                                                     @RequestBody DependentDto dependentDto) {
        return new ResponseEntity<>(employeeService.addDependent(currentUser.getId(), dependentDto), HttpStatus.CREATED);
    }

    @RequestMapping(value = "/me/dependents/{id}", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<DependentDto> updateDependent(@AuthenticationPrincipal UserPrincipal currentUser,
                                                        @PathVariable Long id,
                                                        @RequestBody DependentDto dependentDto) {
        return ResponseEntity.ok(employeeService.updateDependent(currentUser.getId(), id, dependentDto));
    }

    @DeleteMapping("/me/dependents/{id}")
    public ResponseEntity<Void> deleteDependent(@AuthenticationPrincipal UserPrincipal currentUser,
                                                @PathVariable Long id) {
        employeeService.deleteDependent(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    // Qualifications & Skills Hub Endpoints
    @GetMapping("/me/qualifications")
    public ResponseEntity<QualificationsDto> getQualifications(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(employeeService.getQualifications(currentUser.getId()));
    }

    // Work Experience
    @PostMapping("/me/work-experience")
    public ResponseEntity<WorkExperienceDto> addWorkExperience(@AuthenticationPrincipal UserPrincipal currentUser,
                                                               @RequestBody WorkExperienceDto dto) {
        return new ResponseEntity<>(employeeService.addWorkExperience(currentUser.getId(), dto), HttpStatus.CREATED);
    }

    @RequestMapping(value = "/me/work-experience/{id}", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<WorkExperienceDto> updateWorkExperience(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                  @PathVariable Long id,
                                                                  @RequestBody WorkExperienceDto dto) {
        return ResponseEntity.ok(employeeService.updateWorkExperience(currentUser.getId(), id, dto));
    }

    @DeleteMapping("/me/work-experience/{id}")
    public ResponseEntity<Void> deleteWorkExperiencePath(@AuthenticationPrincipal UserPrincipal currentUser,
                                                         @PathVariable Long id) {
        employeeService.deleteWorkExperience(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/work-experience")
    public ResponseEntity<Void> deleteWorkExperienceParam(@AuthenticationPrincipal UserPrincipal currentUser,
                                                          @RequestParam(required = false) Long id) {
        if (id != null) {
            employeeService.deleteWorkExperience(currentUser.getId(), id);
        }
        return ResponseEntity.noContent().build();
    }

    // Education
    @PostMapping("/me/education")
    public ResponseEntity<EducationDto> addEducation(@AuthenticationPrincipal UserPrincipal currentUser,
                                                     @RequestBody EducationDto dto) {
        return new ResponseEntity<>(employeeService.addEducation(currentUser.getId(), dto), HttpStatus.CREATED);
    }

    @RequestMapping(value = "/me/education/{id}", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<EducationDto> updateEducation(@AuthenticationPrincipal UserPrincipal currentUser,
                                                        @PathVariable Long id,
                                                        @RequestBody EducationDto dto) {
        return ResponseEntity.ok(employeeService.updateEducation(currentUser.getId(), id, dto));
    }

    @DeleteMapping("/me/education/{id}")
    public ResponseEntity<Void> deleteEducationPath(@AuthenticationPrincipal UserPrincipal currentUser,
                                                    @PathVariable Long id) {
        employeeService.deleteEducation(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/education")
    public ResponseEntity<Void> deleteEducationParam(@AuthenticationPrincipal UserPrincipal currentUser,
                                                     @RequestParam(required = false) Long id) {
        if (id != null) {
            employeeService.deleteEducation(currentUser.getId(), id);
        }
        return ResponseEntity.noContent().build();
    }

    // Skills
    @PostMapping("/me/skills")
    public ResponseEntity<SkillDto> addSkill(@AuthenticationPrincipal UserPrincipal currentUser,
                                             @RequestBody SkillDto dto) {
        return new ResponseEntity<>(employeeService.addSkill(currentUser.getId(), dto), HttpStatus.CREATED);
    }

    @RequestMapping(value = "/me/skills/{id}", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<SkillDto> updateSkill(@AuthenticationPrincipal UserPrincipal currentUser,
                                                @PathVariable Long id,
                                                @RequestBody SkillDto dto) {
        return ResponseEntity.ok(employeeService.updateSkill(currentUser.getId(), id, dto));
    }

    @DeleteMapping("/me/skills/{id}")
    public ResponseEntity<Void> deleteSkillPath(@AuthenticationPrincipal UserPrincipal currentUser,
                                                @PathVariable Long id) {
        employeeService.deleteSkill(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/skills")
    public ResponseEntity<Void> deleteSkillParam(@AuthenticationPrincipal UserPrincipal currentUser,
                                                 @RequestParam(required = false) Long id) {
        if (id != null) {
            employeeService.deleteSkill(currentUser.getId(), id);
        }
        return ResponseEntity.noContent().build();
    }

    // Languages
    @PostMapping("/me/languages")
    public ResponseEntity<LanguageDto> addLanguage(@AuthenticationPrincipal UserPrincipal currentUser,
                                                   @RequestBody LanguageDto dto) {
        return new ResponseEntity<>(employeeService.addLanguage(currentUser.getId(), dto), HttpStatus.CREATED);
    }

    @RequestMapping(value = "/me/languages/{id}", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<LanguageDto> updateLanguage(@AuthenticationPrincipal UserPrincipal currentUser,
                                                      @PathVariable Long id,
                                                      @RequestBody LanguageDto dto) {
        return ResponseEntity.ok(employeeService.updateLanguage(currentUser.getId(), id, dto));
    }

    @DeleteMapping("/me/languages/{id}")
    public ResponseEntity<Void> deleteLanguagePath(@AuthenticationPrincipal UserPrincipal currentUser,
                                                   @PathVariable Long id) {
        employeeService.deleteLanguage(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/languages")
    public ResponseEntity<Void> deleteLanguageParam(@AuthenticationPrincipal UserPrincipal currentUser,
                                                    @RequestParam(required = false) Long id) {
        if (id != null) {
            employeeService.deleteLanguage(currentUser.getId(), id);
        }
        return ResponseEntity.noContent().build();
    }

    // Licenses
    @PostMapping("/me/licenses")
    public ResponseEntity<LicenseDto> addLicense(@AuthenticationPrincipal UserPrincipal currentUser,
                                                 @RequestBody LicenseDto dto) {
        return new ResponseEntity<>(employeeService.addLicense(currentUser.getId(), dto), HttpStatus.CREATED);
    }

    @RequestMapping(value = "/me/licenses/{id}", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<LicenseDto> updateLicense(@AuthenticationPrincipal UserPrincipal currentUser,
                                                    @PathVariable Long id,
                                                    @RequestBody LicenseDto dto) {
        return ResponseEntity.ok(employeeService.updateLicense(currentUser.getId(), id, dto));
    }

    @DeleteMapping("/me/licenses/{id}")
    public ResponseEntity<Void> deleteLicensePath(@AuthenticationPrincipal UserPrincipal currentUser,
                                                  @PathVariable Long id) {
        employeeService.deleteLicense(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/licenses")
    public ResponseEntity<Void> deleteLicenseParam(@AuthenticationPrincipal UserPrincipal currentUser,
                                                   @RequestParam(required = false) Long id) {
        if (id != null) {
            employeeService.deleteLicense(currentUser.getId(), id);
        }
        return ResponseEntity.noContent().build();
    }

    // Leaves Submission
    @PostMapping("/leaves")
    public ResponseEntity<LeaveRequestDto> applyLeave(@AuthenticationPrincipal UserPrincipal currentUser,
                                                      @RequestBody LeaveRequestDto leaveRequestDto) {
        EmployeeDto existingEmployee = employeeService.getEmployeeByUserId(currentUser.getId());
        leaveRequestDto.setEmployeeId(existingEmployee.getId());
        return new ResponseEntity<>(leaveService.applyLeave(leaveRequestDto), HttpStatus.CREATED);
    }

    @GetMapping("/leaves")
    public ResponseEntity<List<LeaveRequestDto>> getMyLeaves(@AuthenticationPrincipal UserPrincipal currentUser) {
        EmployeeDto existingEmployee = employeeService.getEmployeeByUserId(currentUser.getId());
        return ResponseEntity.ok(leaveService.getLeavesByEmployee(existingEmployee.getId()));
    }

    // Timesheet Submission
    @PostMapping("/timesheets")
    public ResponseEntity<TimesheetDto> submitTimesheet(@AuthenticationPrincipal UserPrincipal currentUser,
                                                        @RequestBody TimesheetDto timesheetDto) {
        EmployeeDto existingEmployee = employeeService.getEmployeeByUserId(currentUser.getId());
        timesheetDto.setEmployeeId(existingEmployee.getId());
        return new ResponseEntity<>(timesheetService.submitTimesheet(timesheetDto), HttpStatus.CREATED);
    }

    @GetMapping("/timesheets")
    public ResponseEntity<List<TimesheetDto>> getMyTimesheets(@AuthenticationPrincipal UserPrincipal currentUser) {
        EmployeeDto existingEmployee = employeeService.getEmployeeByUserId(currentUser.getId());
        return ResponseEntity.ok(timesheetService.getTimesheetsByEmployee(existingEmployee.getId()));
    }

    // Performance Reviews
    @GetMapping("/performance")
    public ResponseEntity<List<PerformanceDto>> getMyPerformance(@AuthenticationPrincipal UserPrincipal currentUser) {
        EmployeeDto existingEmployee = employeeService.getEmployeeByUserId(currentUser.getId());
        return ResponseEntity.ok(performanceService.getPerformanceReviewsByEmployee(existingEmployee.getId()));
    }
}
