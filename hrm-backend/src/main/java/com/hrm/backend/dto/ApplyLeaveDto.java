package com.hrm.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.time.LocalDate;

public class ApplyLeaveDto {
    private Long leaveTypeId;

    @JsonAlias({"startDate", "fromDate"})
    private LocalDate fromDate;

    @JsonAlias({"endDate", "toDate"})
    private LocalDate toDate;

    @JsonAlias({"startDate", "fromDate"})
    private LocalDate startDate;

    @JsonAlias({"endDate", "toDate"})
    private LocalDate endDate;

    private String reason;

    public ApplyLeaveDto() {
    }

    public ApplyLeaveDto(Long leaveTypeId, LocalDate fromDate, LocalDate toDate, String reason) {
        this.leaveTypeId = leaveTypeId;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.startDate = fromDate;
        this.endDate = toDate;
        this.reason = reason;
    }

    public Long getLeaveTypeId() {
        return leaveTypeId;
    }

    public void setLeaveTypeId(Long leaveTypeId) {
        this.leaveTypeId = leaveTypeId;
    }

    public LocalDate getFromDate() {
        return fromDate != null ? fromDate : startDate;
    }

    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
        if (this.startDate == null) {
            this.startDate = fromDate;
        }
    }

    public LocalDate getToDate() {
        return toDate != null ? toDate : endDate;
    }

    public void setToDate(LocalDate toDate) {
        this.toDate = toDate;
        if (this.endDate == null) {
            this.endDate = toDate;
        }
    }

    public LocalDate getStartDate() {
        return startDate != null ? startDate : fromDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
        if (this.fromDate == null) {
            this.fromDate = startDate;
        }
    }

    public LocalDate getEndDate() {
        return endDate != null ? endDate : toDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
        if (this.toDate == null) {
            this.toDate = endDate;
        }
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

