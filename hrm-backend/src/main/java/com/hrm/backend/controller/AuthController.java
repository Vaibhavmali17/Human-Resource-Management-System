package com.hrm.backend.controller;

import com.hrm.backend.dto.ChangePasswordRequest;
import com.hrm.backend.dto.JwtAuthResponse;
import com.hrm.backend.dto.LoginRequest;
import com.hrm.backend.dto.SignupRequest;
import com.hrm.backend.security.UserPrincipal;
import com.hrm.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
        JwtAuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody SignupRequest signupRequest) {
        String response = authService.register(signupRequest);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request,
                                                 @AuthenticationPrincipal UserPrincipal currentUser) {
        String response = authService.changePassword(currentUser.getUsername(), request);
        return ResponseEntity.ok(response);
    }
}
