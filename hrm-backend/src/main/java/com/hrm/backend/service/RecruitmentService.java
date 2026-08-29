package com.hrm.backend.service;

import com.hrm.backend.dto.RecruitmentDto;
import java.util.List;

public interface RecruitmentService {
    RecruitmentDto createApplication(RecruitmentDto recruitmentDto);
    RecruitmentDto getApplicationById(Long id);
    List<RecruitmentDto> getAllApplications();
    RecruitmentDto updateApplicationStatus(Long id, String status, String feedback);
    void deleteApplication(Long id);
}
