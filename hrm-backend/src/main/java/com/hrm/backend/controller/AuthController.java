package com.hrm.backend.controller;

import com.hrm.backend.dto.LoginRequest;
import com.hrm.backend.dto.SignupRequest;
import com.hrm.backend.dto.JwtAuthResponse;
import com.hrm.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody LoginRequest loginRequest) {
        String token = authService.login(loginRequest);
        return ResponseEntity.ok(new JwtAuthResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody SignupRequest signupRequest) {
        String response = authService.register(signupRequest);
        return ResponseEntity.ok(response);
    }
}
