package com.hrm.backend.service;

import com.hrm.backend.dto.TimesheetDto;
import java.util.List;

public interface TimesheetService {
    TimesheetDto submitTimesheet(TimesheetDto timesheetDto);
    List<TimesheetDto> getTimesheetsByEmployee(Long employeeId);
    List<TimesheetDto> getAllTimesheets();
    TimesheetDto updateTimesheetStatus(Long timesheetId, String status, Long approvedById);
}
