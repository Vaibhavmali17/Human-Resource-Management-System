package com.hrm.backend.dto;

public class LeaveTypeDto {
    private Long id;
    private String name;
    private Double defaultDaysPerYear;

    public LeaveTypeDto() {
    }

    public LeaveTypeDto(Long id, String name, Double defaultDaysPerYear) {
        this.id = id;
        this.name = name;
        this.defaultDaysPerYear = defaultDaysPerYear;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getDefaultDaysPerYear() {
        return defaultDaysPerYear;
    }

    public void setDefaultDaysPerYear(Double defaultDaysPerYear) {
        this.defaultDaysPerYear = defaultDaysPerYear;
    }
}
