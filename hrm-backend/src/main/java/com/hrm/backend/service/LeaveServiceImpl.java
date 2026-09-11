package com.hrm.backend.service;

import com.hrm.backend.dto.*;
import com.hrm.backend.entity.*;
import com.hrm.backend.exception.ResourceNotFoundException;
import com.hrm.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;


@Service
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public LeaveServiceImpl(LeaveTypeRepository leaveTypeRepository,
                            LeaveBalanceRepository leaveBalanceRepository,
                            LeaveRequestRepository leaveRequestRepository,
                            EmployeeRepository employeeRepository,
                            UserRepository userRepository,
                            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    private void ensureSchema() {
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS applied_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS duration_days DOUBLE PRECISION DEFAULT 1.0"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS from_date DATE"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS to_date DATE"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS leave_type_id BIGINT"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS admin_remarks TEXT"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS reason TEXT"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING'"); } catch (Exception ignored) {}

        try { jdbcTemplate.execute("INSERT INTO leave_types (name, default_days_per_year) VALUES ('Casual Leave', 12.0), ('Sick Leave', 10.0), ('Annual Leave', 15.0) ON CONFLICT DO NOTHING"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("UPDATE leave_requests SET leave_type_id = (SELECT id FROM leave_types ORDER BY id ASC LIMIT 1) WHERE leave_type_id IS NULL"); } catch (Exception ignored) {}
        try { jdbcTemplate.execute("UPDATE leave_balances SET leave_type_id = (SELECT id FROM leave_types ORDER BY id ASC LIMIT 1) WHERE leave_type_id IS NULL"); } catch (Exception ignored) {}
    }



    private void seedDefaultLeaveTypesIfEmpty() {
        ensureSchema();
        if (leaveTypeRepository.count() == 0) {
            leaveTypeRepository.save(new LeaveType("Casual Leave", 12.0));
            leaveTypeRepository.save(new LeaveType("Sick Leave", 10.0));
            leaveTypeRepository.save(new LeaveType("Annual Leave", 15.0));
        }
    }

    private Employee getOrCreateEmployee(Long userId) {
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

    private List<LeaveBalance> ensureDefaultBalancesForEmployee(Employee employee) {
        seedDefaultLeaveTypesIfEmpty();
        List<LeaveType> types = leaveTypeRepository.findAll();
        List<LeaveBalance> existing = leaveBalanceRepository.findByEmployeeId(employee.getId());

        for (LeaveType type : types) {
            boolean exists = existing.stream().anyMatch(b -> b.getLeaveType() != null && b.getLeaveType().getId().equals(type.getId()));
            if (!exists) {
                LeaveBalance newBalance = new LeaveBalance(
                        employee,
                        type,
                        type.getDefaultDaysPerYear(),
                        0.0,
                        type.getDefaultDaysPerYear()
                );
                existing.add(leaveBalanceRepository.save(newBalance));
            }
        }
        return existing;
    }

    @Override
    public List<LeaveTypeDto> getAllLeaveTypes() {
        seedDefaultLeaveTypesIfEmpty();
        return leaveTypeRepository.findAll().stream()
                .map(t -> new LeaveTypeDto(t.getId(), t.getName(), t.getDefaultDaysPerYear()))
                .collect(Collectors.toList());
    }

    @Override
    public List<LeaveBalanceDto> getLeaveBalancesByUserId(Long userId) {
        Employee employee = getOrCreateEmployee(userId);
        List<LeaveBalance> balances = ensureDefaultBalancesForEmployee(employee);
        return balances.stream()
                .map(this::mapToBalanceDto)
                .collect(Collectors.toList());
    }

    @Override
    public LeaveRequestDto applyLeave(Long userId, ApplyLeaveDto applyDto) {
        ensureSchema();
        Employee employee = getOrCreateEmployee(userId);
        ensureDefaultBalancesForEmployee(employee);

        java.time.LocalDate from = applyDto.getFromDate() != null ? applyDto.getFromDate() : applyDto.getStartDate();
        java.time.LocalDate to = applyDto.getToDate() != null ? applyDto.getToDate() : applyDto.getEndDate();

        if (from == null || to == null) {
            throw new IllegalArgumentException("From Date and To Date are required.");
        }
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("To Date cannot be before From Date.");
        }

        LeaveType leaveType = leaveTypeRepository.findById(applyDto.getLeaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", "id", applyDto.getLeaveTypeId()));

        double duration = ChronoUnit.DAYS.between(from, to) + 1.0;

        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeId(employee.getId(), leaveType.getId())
                .orElseThrow(() -> new ResourceNotFoundException("LeaveBalance", "leaveTypeId", leaveType.getId()));

        if (balance.getRemainingDays() < duration) {
            throw new IllegalArgumentException("Insufficient leave balance for " + leaveType.getName() + 
                    ". Requested: " + duration + " days, Remaining: " + balance.getRemainingDays() + " days.");
        }

        LeaveRequest request = new LeaveRequest();
        request.setEmployee(employee);
        request.setLeaveType(leaveType);
        request.setFromDate(from);
        request.setToDate(to);
        request.setDurationDays(duration);
        request.setReason(applyDto.getReason());
        request.setStatus(LeaveStatus.PENDING);
        request.setAppliedOn(LocalDateTime.now());



        LeaveRequest saved = leaveRequestRepository.save(request);
        return mapToRequestDto(saved);
    }

    @Override
    public List<LeaveRequestDto> getMyLeaveHistory(Long userId) {
        ensureSchema();
        try {
            Employee employee = getOrCreateEmployee(userId);
            return leaveRequestRepository.findByEmployeeIdOrderByIdDesc(employee.getId()).stream()
                    .map(this::mapToRequestDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error reading leave history: " + e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    @Override
    public List<LeaveRequestDto> getPendingLeaveRequests() {
        ensureSchema();
        try {
            return leaveRequestRepository.findByStatusOrderByIdDesc(LeaveStatus.PENDING).stream()
                    .map(this::mapToRequestDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error reading pending leave requests: " + e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    @Override
    public List<LeaveRequestDto> getAllLeaveRequests() {
        ensureSchema();
        try {
            return leaveRequestRepository.findAllByOrderByIdDesc().stream()
                    .map(this::mapToRequestDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error reading all leave requests: " + e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    @Override
    public LeaveRequestDto processLeaveAction(Long requestId, LeaveActionDto actionDto) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", requestId));

        if (request.getStatus() == LeaveStatus.PENDING && actionDto.getStatus() == LeaveStatus.APPROVED && request.getLeaveType() != null) {
            Employee employee = request.getEmployee();
            LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeId(employee.getId(), request.getLeaveType().getId())
                    .orElse(null);

            if (balance != null) {
                if (balance.getRemainingDays() < request.getDurationDays()) {
                    throw new IllegalArgumentException("Cannot approve: Employee has insufficient remaining leave balance (" + 
                            balance.getRemainingDays() + " days left).");
                }

                balance.setUsedDays(balance.getUsedDays() + request.getDurationDays());
                balance.setRemainingDays(balance.getTotalDays() - balance.getUsedDays());
                leaveBalanceRepository.save(balance);
            }
        }

        request.setStatus(actionDto.getStatus());
        if (actionDto.getAdminRemarks() != null) {
            request.setAdminRemarks(actionDto.getAdminRemarks());
        }

        LeaveRequest updated = leaveRequestRepository.save(request);
        return mapToRequestDto(updated);
    }

    private LeaveBalanceDto mapToBalanceDto(LeaveBalance b) {
        Long empId = b.getEmployee() != null ? b.getEmployee().getId() : null;
        Long typeId = b.getLeaveType() != null ? b.getLeaveType().getId() : 1L;
        String typeName = b.getLeaveType() != null ? b.getLeaveType().getName() : "General Leave";

        return new LeaveBalanceDto(
                b.getId(),
                empId,
                typeId,
                typeName,
                b.getTotalDays(),
                b.getUsedDays(),
                b.getRemainingDays()
        );
    }

    private LeaveRequestDto mapToRequestDto(LeaveRequest r) {
        String empName = r.getEmployee() != null 
                ? (r.getEmployee().getFirstName() + " " + (r.getEmployee().getLastName() != null ? r.getEmployee().getLastName() : "")).trim()
                : "Unknown Employee";
        Long empId = r.getEmployee() != null ? r.getEmployee().getId() : null;
        String dept = r.getEmployee() != null ? r.getEmployee().getDepartment() : "General";
        
        Long leaveTypeId = r.getLeaveType() != null ? r.getLeaveType().getId() : 1L;
        String leaveTypeName = r.getLeaveType() != null ? r.getLeaveType().getName() : "General Leave";

        return new LeaveRequestDto(
                r.getId(),
                empId,
                empName,
                dept,
                leaveTypeId,
                leaveTypeName,
                r.getFromDate(),
                r.getToDate(),
                r.getDurationDays(),
                r.getReason(),
                r.getStatus(),
                r.getAdminRemarks(),
                r.getAppliedOn()
        );
    }
}
