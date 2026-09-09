package com.hrm.backend.repository;

import com.hrm.backend.entity.LeaveRequest;
import com.hrm.backend.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeIdOrderByIdDesc(Long employeeId);
    List<LeaveRequest> findByStatusOrderByIdDesc(LeaveStatus status);
    List<LeaveRequest> findAllByOrderByIdDesc();
}
