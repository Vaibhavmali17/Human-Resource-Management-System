package com.hrm.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Boolean mustChangePassword = false;

    public JwtAuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }

    public JwtAuthResponse(String accessToken, Boolean mustChangePassword) {
        this.accessToken = accessToken;
        this.mustChangePassword = mustChangePassword;
    }
}
