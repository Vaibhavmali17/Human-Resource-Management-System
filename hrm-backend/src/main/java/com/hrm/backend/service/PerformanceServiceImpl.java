package com.hrm.backend.service;

import com.hrm.backend.dto.PerformanceDto;
import com.hrm.backend.entity.Performance;
import com.hrm.backend.entity.Employee;
import com.hrm.backend.exception.ResourceNotFoundException;
import com.hrm.backend.repository.EmployeeRepository;
import com.hrm.backend.repository.PerformanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PerformanceServiceImpl implements PerformanceService {

    private final PerformanceRepository performanceRepository;
    private final EmployeeRepository employeeRepository;

    public PerformanceServiceImpl(PerformanceRepository performanceRepository, EmployeeRepository employeeRepository) {
        this.performanceRepository = performanceRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public PerformanceDto createPerformanceReview(PerformanceDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        Employee reviewer = employeeRepository.findById(dto.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee (reviewer)", "id", dto.getReviewerId()));

        Performance p = new Performance();
        p.setEmployee(employee);
        p.setReviewPeriod(dto.getReviewPeriod());
        p.setRating(dto.getRating());
        p.setFeedback(dto.getFeedback());
        p.setReviewer(reviewer);
        p.setReviewDate(dto.getReviewDate());

        Performance saved = performanceRepository.save(p);
        return mapToDto(saved);
    }

    @Override
    public List<PerformanceDto> getPerformanceReviewsByEmployee(Long employeeId) {
        return performanceRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<PerformanceDto> getAllPerformanceReviews() {
        return performanceRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    private PerformanceDto mapToDto(Performance p) {
        PerformanceDto dto = new PerformanceDto();
        dto.setId(p.getId());
        dto.setEmployeeId(p.getEmployee().getId());
        dto.setReviewPeriod(p.getReviewPeriod());
        dto.setRating(p.getRating());
        dto.setFeedback(p.getFeedback());
        dto.setReviewerId(p.getReviewer().getId());
        dto.setReviewDate(p.getReviewDate());
        return dto;
    }
}
