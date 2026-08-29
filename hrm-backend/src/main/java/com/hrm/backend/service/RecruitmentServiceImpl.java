package com.hrm.backend.service;

import com.hrm.backend.dto.RecruitmentDto;
import com.hrm.backend.entity.Recruitment;
import com.hrm.backend.entity.ApplicationStatus;
import com.hrm.backend.exception.ResourceNotFoundException;
import com.hrm.backend.repository.RecruitmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecruitmentServiceImpl implements RecruitmentService {

    private final RecruitmentRepository recruitmentRepository;

    public RecruitmentServiceImpl(RecruitmentRepository recruitmentRepository) {
        this.recruitmentRepository = recruitmentRepository;
    }

    @Override
    public RecruitmentDto createApplication(RecruitmentDto dto) {
        Recruitment recruitment = new Recruitment();
        recruitment.setCandidateName(dto.getCandidateName());
        recruitment.setCandidateEmail(dto.getCandidateEmail());
        recruitment.setJobTitle(dto.getJobTitle());
        recruitment.setApplicationDate(dto.getApplicationDate());
        recruitment.setStatus(ApplicationStatus.APPLIED);
        recruitment.setResumeUrl(dto.getResumeUrl());
        recruitment.setFeedback(dto.getFeedback());

        Recruitment saved = recruitmentRepository.save(recruitment);
        return mapToDto(saved);
    }

    @Override
    public RecruitmentDto getApplicationById(Long id) {
        Recruitment recruitment = recruitmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recruitment", "id", id));
        return mapToDto(recruitment);
    }

    @Override
    public List<RecruitmentDto> getAllApplications() {
        return recruitmentRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public RecruitmentDto updateApplicationStatus(Long id, String status, String feedback) {
        Recruitment recruitment = recruitmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recruitment", "id", id));

        recruitment.setStatus(ApplicationStatus.valueOf(status.toUpperCase()));
        if (feedback != null) {
            recruitment.setFeedback(feedback);
        }

        Recruitment updated = recruitmentRepository.save(recruitment);
        return mapToDto(updated);
    }

    @Override
    public void deleteApplication(Long id) {
        Recruitment recruitment = recruitmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recruitment", "id", id));
        recruitmentRepository.delete(recruitment);
    }

    private RecruitmentDto mapToDto(Recruitment r) {
        RecruitmentDto dto = new RecruitmentDto();
        dto.setId(r.getId());
        dto.setCandidateName(r.getCandidateName());
        dto.setCandidateEmail(r.getCandidateEmail());
        dto.setJobTitle(r.getJobTitle());
        dto.setApplicationDate(r.getApplicationDate());
        dto.setStatus(r.getStatus());
        dto.setResumeUrl(r.getResumeUrl());
        dto.setFeedback(r.getFeedback());
        return dto;
    }
}
