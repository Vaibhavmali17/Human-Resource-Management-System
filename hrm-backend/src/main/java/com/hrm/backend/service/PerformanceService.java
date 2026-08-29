package com.hrm.backend.service;

import com.hrm.backend.dto.PerformanceDto;
import java.util.List;

public interface PerformanceService {
    PerformanceDto createPerformanceReview(PerformanceDto performanceDto);
    List<PerformanceDto> getPerformanceReviewsByEmployee(Long employeeId);
    List<PerformanceDto> getAllPerformanceReviews();
}
