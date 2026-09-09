package com.hrm.backend.dto;

import com.hrm.backend.entity.LeaveStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LeaveRequestDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private Long leaveTypeId;
    private String leaveTypeName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Double durationDays;
    private String reason;
    private LeaveStatus status;
    private String adminRemarks;
    private LocalDateTime appliedOn;

    public LeaveRequestDto() {
    }

    public LeaveRequestDto(Long id, Long employeeId, String employeeName, String department, Long leaveTypeId, String leaveTypeName, LocalDate fromDate, LocalDate toDate, Double durationDays, String reason, LeaveStatus status, String adminRemarks, LocalDateTime appliedOn) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.department = department;
        this.leaveTypeId = leaveTypeId;
        this.leaveTypeName = leaveTypeName;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.durationDays = durationDays;
        this.reason = reason;
        this.status = status;
        this.adminRemarks = adminRemarks;
        this.appliedOn = appliedOn;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Long getLeaveTypeId() {
        return leaveTypeId;
    }

    public void setLeaveTypeId(Long leaveTypeId) {
        this.leaveTypeId = leaveTypeId;
    }

    public String getLeaveTypeName() {
        return leaveTypeName;
    }

    public void setLeaveTypeName(String leaveTypeName) {
        this.leaveTypeName = leaveTypeName;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
    }

    public void setToDate(LocalDate toDate) {
        this.toDate = toDate;
    }

    public Double getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Double durationDays) {
        this.durationDays = durationDays;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LeaveStatus getStatus() {
        return status;
    }

    public void setStatus(LeaveStatus status) {
        this.status = status;
    }

    public String getAdminRemarks() {
        return adminRemarks;
    }

    public void setAdminRemarks(String adminRemarks) {
        this.adminRemarks = adminRemarks;
    }

    public LocalDateTime getAppliedOn() {
        return appliedOn;
    }

    public void setAppliedOn(LocalDateTime appliedOn) {
        this.appliedOn = appliedOn;
    }
}
