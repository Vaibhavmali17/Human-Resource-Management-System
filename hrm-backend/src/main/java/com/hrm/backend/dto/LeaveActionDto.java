package com.hrm.backend.dto;

import com.hrm.backend.entity.LeaveStatus;

public class LeaveActionDto {
    private LeaveStatus status;
    private String adminRemarks;

    public LeaveActionDto() {
    }

    public LeaveActionDto(LeaveStatus status, String adminRemarks) {
        this.status = status;
        this.adminRemarks = adminRemarks;
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
}
