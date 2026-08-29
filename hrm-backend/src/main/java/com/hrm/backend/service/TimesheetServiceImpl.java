package com.hrm.backend.service;

import com.hrm.backend.dto.TimesheetDto;
import com.hrm.backend.entity.Timesheet;
import com.hrm.backend.entity.TimesheetStatus;
import com.hrm.backend.entity.Employee;
import com.hrm.backend.exception.ResourceNotFoundException;
import com.hrm.backend.repository.EmployeeRepository;
import com.hrm.backend.repository.TimesheetRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimesheetServiceImpl implements TimesheetService {

    private final TimesheetRepository timesheetRepository;
    private final EmployeeRepository employeeRepository;

    public TimesheetServiceImpl(TimesheetRepository timesheetRepository, EmployeeRepository employeeRepository) {
        this.timesheetRepository = timesheetRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public TimesheetDto submitTimesheet(TimesheetDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        Timesheet ts = new Timesheet();
        ts.setEmployee(employee);
        ts.setWeekStartDate(dto.getWeekStartDate());
        ts.setHoursWorked(dto.getHoursWorked());
        ts.setStatus(TimesheetStatus.SUBMITTED);
        ts.setComments(dto.getComments());

        Timesheet saved = timesheetRepository.save(ts);
        return mapToDto(saved);
    }

    @Override
    public List<TimesheetDto> getTimesheetsByEmployee(Long employeeId) {
        return timesheetRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<TimesheetDto> getAllTimesheets() {
        return timesheetRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public TimesheetDto updateTimesheetStatus(Long timesheetId, String status, Long approvedById) {
        Timesheet ts = timesheetRepository.findById(timesheetId)
                .orElseThrow(() -> new ResourceNotFoundException("Timesheet", "id", timesheetId));

        Employee manager = employeeRepository.findById(approvedById)
                .orElseThrow(() -> new ResourceNotFoundException("Employee (approver)", "id", approvedById));

        ts.setStatus(TimesheetStatus.valueOf(status.toUpperCase()));
        ts.setApprovedBy(manager);

        Timesheet updated = timesheetRepository.save(ts);
        return mapToDto(updated);
    }

    private TimesheetDto mapToDto(Timesheet ts) {
        TimesheetDto dto = new TimesheetDto();
        dto.setId(ts.getId());
        dto.setEmployeeId(ts.getEmployee().getId());
        dto.setWeekStartDate(ts.getWeekStartDate());
        dto.setHoursWorked(ts.getHoursWorked());
        dto.setStatus(ts.getStatus());
        dto.setComments(ts.getComments());
        if (ts.getApprovedBy() != null) {
            dto.setApprovedById(ts.getApprovedBy().getId());
        }
        return dto;
    }
}
