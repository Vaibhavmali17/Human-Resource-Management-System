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

    @DeleteMapping("/me/dependents/{id}")
    public ResponseEntity<Void> deleteDependent(@AuthenticationPrincipal UserPrincipal currentUser,
                                                @PathVariable Long id) {
        employeeService.deleteDependent(currentUser.getId(), id);
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
