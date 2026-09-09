package com.hrm.backend.dto;

import java.time.LocalDate;

public class ApplyLeaveDto {
    private Long leaveTypeId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String reason;

    public ApplyLeaveDto() {
    }

    public ApplyLeaveDto(Long leaveTypeId, LocalDate fromDate, LocalDate toDate, String reason) {
        this.leaveTypeId = leaveTypeId;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.reason = reason;
    }

    public Long getLeaveTypeId() {
        return leaveTypeId;
    }

    public void setLeaveTypeId(Long leaveTypeId) {
        this.leaveTypeId = leaveTypeId;
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

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
