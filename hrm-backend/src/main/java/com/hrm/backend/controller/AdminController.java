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
@RequestMapping("/api/admin")
public class AdminController {

    private final EmployeeService employeeService;
    private final LeaveService leaveService;
    private final TimesheetService timesheetService;
    private final RecruitmentService recruitmentService;
    private final PerformanceService performanceService;
    private final AuthService authService;

    public AdminController(EmployeeService employeeService,
                           LeaveService leaveService,
                           TimesheetService timesheetService,
                           RecruitmentService recruitmentService,
                           PerformanceService performanceService,
                           AuthService authService) {
        this.employeeService = employeeService;
        this.leaveService = leaveService;
        this.timesheetService = timesheetService;
        this.recruitmentService = recruitmentService;
        this.performanceService = performanceService;
        this.authService = authService;
    }

    @PostMapping("/create-admin")
    public ResponseEntity<String> createAdmin(@RequestBody SignupRequest signupRequest) {
        return ResponseEntity.ok(authService.registerAdmin(signupRequest));
    }

    // PIM - Employee CRUD
    @PostMapping("/employees")
    public ResponseEntity<EmployeeDto> createEmployee(@RequestBody EmployeeDto employeeDto) {
        return new ResponseEntity<>(employeeService.createEmployee(employeeDto), HttpStatus.CREATED);
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeDto>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<EmployeeDto> updateEmployee(@PathVariable Long id, @RequestBody EmployeeDto employeeDto) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, employeeDto));
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<String> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok("Employee deleted successfully!");
    }

    // Leave Management Admin Approvals
    @GetMapping("/leaves")
    public ResponseEntity<List<LeaveRequestDto>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaveRequests());
    }

    @PutMapping("/leaves/{id}/approve")
    public ResponseEntity<LeaveRequestDto> approveLeave(@PathVariable Long id,
                                                        @RequestParam String status,
                                                        @AuthenticationPrincipal UserPrincipal currentUser) {
        com.hrm.backend.entity.LeaveStatus leaveStatus = com.hrm.backend.entity.LeaveStatus.valueOf(status.toUpperCase());
        LeaveActionDto actionDto = new LeaveActionDto(leaveStatus, "Processed by Admin");
        return ResponseEntity.ok(leaveService.processLeaveAction(id, actionDto));
    }

    // Timesheet Management Admin Verification
    @GetMapping("/timesheets")
    public ResponseEntity<List<TimesheetDto>> getAllTimesheets() {
        return ResponseEntity.ok(timesheetService.getAllTimesheets());
    }

    @PutMapping("/timesheets/{id}/approve")
    public ResponseEntity<TimesheetDto> approveTimesheet(@PathVariable Long id,
                                                         @RequestParam String status,
                                                         @AuthenticationPrincipal UserPrincipal currentUser) {
        EmployeeDto adminEmployee = employeeService.getEmployeeByUserId(currentUser.getId());
        return ResponseEntity.ok(timesheetService.updateTimesheetStatus(id, status, adminEmployee.getId()));
    }

    // Recruitment Management
    @PostMapping("/recruitments")
    public ResponseEntity<RecruitmentDto> createRecruitment(@RequestBody RecruitmentDto recruitmentDto) {
        return new ResponseEntity<>(recruitmentService.createApplication(recruitmentDto), HttpStatus.CREATED);
    }

    @PutMapping("/recruitments/{id}")
    public ResponseEntity<RecruitmentDto> updateRecruitmentStatus(@PathVariable Long id,
                                                                  @RequestParam String status,
                                                                  @RequestParam(required = false) String feedback) {
        return ResponseEntity.ok(recruitmentService.updateApplicationStatus(id, status, feedback));
    }

    @GetMapping("/recruitments")
    public ResponseEntity<List<RecruitmentDto>> getAllRecruitments() {
        return ResponseEntity.ok(recruitmentService.getAllApplications());
    }

    @DeleteMapping("/recruitments/{id}")
    public ResponseEntity<String> deleteRecruitment(@PathVariable Long id) {
        recruitmentService.deleteApplication(id);
        return ResponseEntity.ok("Application deleted successfully!");
    }

    // Performance Appraisals Admin Input
    @PostMapping("/performance")
    public ResponseEntity<PerformanceDto> createPerformanceReview(@RequestBody PerformanceDto performanceDto,
                                                                   @AuthenticationPrincipal UserPrincipal currentUser) {
        EmployeeDto adminEmployee = employeeService.getEmployeeByUserId(currentUser.getId());
        performanceDto.setReviewerId(adminEmployee.getId());
        return new ResponseEntity<>(performanceService.createPerformanceReview(performanceDto), HttpStatus.CREATED);
    }
}
