package com.hrm.backend.service;

import com.hrm.backend.dto.LoginRequest;
import com.hrm.backend.dto.SignupRequest;

public interface AuthService {
    String login(LoginRequest loginRequest);
    String register(SignupRequest signupRequest);
}
