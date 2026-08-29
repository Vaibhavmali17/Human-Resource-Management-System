package com.hrm.backend.service;

import com.hrm.backend.dto.LeaveRequestDto;
import com.hrm.backend.entity.LeaveRequest;
import com.hrm.backend.entity.LeaveStatus;
import com.hrm.backend.entity.Employee;
import com.hrm.backend.exception.ResourceNotFoundException;
import com.hrm.backend.repository.EmployeeRepository;
import com.hrm.backend.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveServiceImpl(LeaveRequestRepository leaveRequestRepository, EmployeeRepository employeeRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public LeaveRequestDto applyLeave(LeaveRequestDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        LeaveRequest leave = new LeaveRequest();
        leave.setEmployee(employee);
        leave.setStartDate(dto.getStartDate());
        leave.setEndDate(dto.getEndDate());
        leave.setLeaveType(dto.getLeaveType());
        leave.setStatus(LeaveStatus.PENDING);
        leave.setReason(dto.getReason());

        LeaveRequest saved = leaveRequestRepository.save(leave);
        return mapToDto(saved);
    }

    @Override
    public List<LeaveRequestDto> getLeavesByEmployee(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestDto> getAllLeaves() {
        return leaveRequestRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public LeaveRequestDto updateLeaveStatus(Long leaveId, String status, Long approvedById) {
        LeaveRequest leave = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", leaveId));

        Employee manager = employeeRepository.findById(approvedById)
                .orElseThrow(() -> new ResourceNotFoundException("Employee (approver)", "id", approvedById));

        leave.setStatus(LeaveStatus.valueOf(status.toUpperCase()));
        leave.setApprovedBy(manager);

        LeaveRequest updated = leaveRequestRepository.save(leave);
        return mapToDto(updated);
    }

    private LeaveRequestDto mapToDto(LeaveRequest leave) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(leave.getId());
        dto.setEmployeeId(leave.getEmployee().getId());
        dto.setStartDate(leave.getStartDate());
        dto.setEndDate(leave.getEndDate());
        dto.setLeaveType(leave.getLeaveType());
        dto.setStatus(leave.getStatus());
        dto.setReason(leave.getReason());
        if (leave.getApprovedBy() != null) {
            dto.setApprovedById(leave.getApprovedBy().getId());
        }
        return dto;
    }
}
