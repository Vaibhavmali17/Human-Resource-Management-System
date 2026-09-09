package com.hrm.backend.dto;

public class LeaveBalanceDto {
    private Long id;
    private Long employeeId;
    private Long leaveTypeId;
    private String leaveTypeName;
    private Double totalDays;
    private Double usedDays;
    private Double remainingDays;

    public LeaveBalanceDto() {
    }

    public LeaveBalanceDto(Long id, Long employeeId, Long leaveTypeId, String leaveTypeName, Double totalDays, Double usedDays, Double remainingDays) {
        this.id = id;
        this.employeeId = employeeId;
        this.leaveTypeId = leaveTypeId;
        this.leaveTypeName = leaveTypeName;
        this.totalDays = totalDays;
        this.usedDays = usedDays;
        this.remainingDays = remainingDays;
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

    public Double getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(Double totalDays) {
        this.totalDays = totalDays;
    }

    public Double getUsedDays() {
        return usedDays;
    }

    public void setUsedDays(Double usedDays) {
        this.usedDays = usedDays;
    }

    public Double getRemainingDays() {
        return remainingDays;
    }

    public void setRemainingDays(Double remainingDays) {
        this.remainingDays = remainingDays;
    }
}
