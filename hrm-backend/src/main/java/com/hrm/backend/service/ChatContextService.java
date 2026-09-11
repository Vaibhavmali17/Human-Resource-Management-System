package com.hrm.backend.service;

import com.hrm.backend.entity.*;
import com.hrm.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ChatContextService {

    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final TimesheetRepository timesheetRepository;
    private final RecruitmentRepository recruitmentRepository;

    public ChatContextService(EmployeeRepository employeeRepository,
                              LeaveBalanceRepository leaveBalanceRepository,
                              LeaveRequestRepository leaveRequestRepository,
                              TimesheetRepository timesheetRepository,
                              RecruitmentRepository recruitmentRepository) {
        this.employeeRepository = employeeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.timesheetRepository = timesheetRepository;
        this.recruitmentRepository = recruitmentRepository;
    }

    public String buildEmployeeContext(Long employeeId) {
        if (employeeId == null) {
            return "No employee record found for the current user.";
        }

        Optional<Employee> empOpt = employeeRepository.findById(employeeId);
        if (empOpt.isEmpty()) {
            return "Employee profile not found.";
        }

        Employee employee = empOpt.get();
        String name = ((employee.getFirstName() != null ? employee.getFirstName() : "") + " " +
                       (employee.getLastName() != null ? employee.getLastName() : "")).trim();
        String department = employee.getDepartment() != null ? employee.getDepartment() : "N/A";
        String designation = employee.getDesignation() != null ? employee.getDesignation() : "N/A";

        // Leave balances
        List<LeaveBalance> balances = leaveBalanceRepository.findByEmployeeId(employeeId);
        String balanceStr = balances.stream()
                .map(b -> {
                    String leaveTypeName = (b.getLeaveType() != null && b.getLeaveType().getName() != null)
                            ? b.getLeaveType().getName() : "Leave";
                    return leaveTypeName + ": " + b.getRemainingDays() + " days remaining (Total: " + b.getTotalDays() + ", Used: " + b.getUsedDays() + ")";
                })
                .collect(Collectors.joining(", "));
        if (balanceStr.isEmpty()) {
            balanceStr = "No leave balances recorded";
        }

        // Pending leave requests count
        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeIdOrderByIdDesc(employeeId);
        long pendingLeavesCount = requests.stream()
                .filter(r -> r.getStatus() == LeaveStatus.PENDING)
                .count();

        // Most recent timesheet status
        List<Timesheet> timesheets = timesheetRepository.findByEmployeeId(employeeId);
        String recentTimesheetStatus = "No timesheets submitted";
        if (timesheets != null && !timesheets.isEmpty()) {
            Timesheet latest = timesheets.get(timesheets.size() - 1);
            recentTimesheetStatus = latest.getStatus() != null ? latest.getStatus().name() : "N/A";
        }

        return String.format(
                "Employee Name: %s, Department: %s, Designation: %s.\n" +
                "Leave Balances: %s.\n" +
                "Pending Leave Requests: %d.\n" +
                "Most Recent Timesheet Status: %s.",
                name, department, designation, balanceStr, pendingLeavesCount, recentTimesheetStatus
        );
    }

    public String buildAdminContext() {
        long totalEmployees = employeeRepository.count();

        long pendingLeavesCount = leaveRequestRepository.findByStatusOrderByIdDesc(LeaveStatus.PENDING).size();

        List<Timesheet> allTimesheets = timesheetRepository.findAll();
        long pendingTimesheetsCount = allTimesheets.stream()
                .filter(t -> t.getStatus() == TimesheetStatus.SUBMITTED)
                .count();

        List<Recruitment> allRecruitments = recruitmentRepository.findAll();
        long openRecruitmentsCount = allRecruitments.stream()
                .filter(r -> r.getStatus() == ApplicationStatus.APPLIED ||
                             r.getStatus() == ApplicationStatus.SHORTLISTED ||
                             r.getStatus() == ApplicationStatus.INTERVIEWED)
                .count();

        return String.format(
                "Company Summary Data:\n" +
                "- Total Employee Count: %d\n" +
                "- Pending Leave Requests (Company-wide): %d\n" +
                "- Pending Timesheets awaiting review: %d\n" +
                "- Open Recruitment Applications in pipeline: %d",
                totalEmployees, pendingLeavesCount, pendingTimesheetsCount, openRecruitmentsCount
        );
    }
}
