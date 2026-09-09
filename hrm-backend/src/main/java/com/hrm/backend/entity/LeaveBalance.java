package com.hrm.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "leave_balances")
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "leave_type_id", nullable = true)
    private LeaveType leaveType;

    @Column(nullable = false)
    private Double totalDays;

    @Column(nullable = false)
    private Double usedDays;

    @Column(nullable = false)
    private Double remainingDays;

    public LeaveBalance() {
    }

    public LeaveBalance(Employee employee, LeaveType leaveType, Double totalDays, Double usedDays, Double remainingDays) {
        this.employee = employee;
        this.leaveType = leaveType;
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

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LeaveType getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(LeaveType leaveType) {
        this.leaveType = leaveType;
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
