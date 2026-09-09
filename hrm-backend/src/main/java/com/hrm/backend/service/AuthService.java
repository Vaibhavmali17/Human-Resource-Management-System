package com.hrm.backend.service;

import com.hrm.backend.dto.ChangePasswordRequest;
import com.hrm.backend.dto.HrOnboardRequest;
import com.hrm.backend.dto.JwtAuthResponse;
import com.hrm.backend.dto.LoginRequest;
import com.hrm.backend.dto.SignupRequest;

import java.util.Map;

public interface AuthService {
    JwtAuthResponse login(LoginRequest loginRequest);
    String register(SignupRequest signupRequest);
    String registerAdmin(SignupRequest signupRequest);
    Map<String, String> onboardHr(HrOnboardRequest request);
    String changePassword(String username, ChangePasswordRequest request);
}
