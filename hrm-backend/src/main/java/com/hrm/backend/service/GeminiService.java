package com.hrm.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrm.backend.dto.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String getReply(String systemContext, String userMessage, List<ChatMessage> history) {
        try {
            List<Map<String, Object>> contents = new ArrayList<>();

            // 1. Build contents list: include history if present
            if (history != null && !history.isEmpty()) {
                for (ChatMessage msg : history) {
                    if (msg.getText() == null || msg.getText().trim().isEmpty()) {
                        continue;
                    }
                    String role = "user";
                    if ("model".equalsIgnoreCase(msg.getRole()) || "assistant".equalsIgnoreCase(msg.getRole()) || "bot".equalsIgnoreCase(msg.getRole())) {
                        role = "model";
                    }
                    contents.add(createContentNode(role, msg.getText()));
                }
            }

            // 2. Add latest user message
            contents.add(createContentNode("user", userMessage));

            // 3. Build request payload
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);

            if (systemContext != null && !systemContext.trim().isEmpty()) {
                Map<String, Object> systemInstruction = new HashMap<>();
                systemInstruction.put("parts", List.of(Map.of("text", systemContext)));
                requestBody.put("systemInstruction", systemInstruction);
            }

            String fullUrl = apiUrl + "?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && parts.size() > 0) {
                        return parts.get(0).path("text").asText();
                    }
                }
            }
            logger.warn("Gemini API returned unexpected response format or empty body: {}", response.getBody());
            return "Sorry, I couldn't process that right now.";
        } catch (Exception e) {
            logger.error("Error communicating with Gemini API: ", e);
            return "Sorry, I couldn't process that right now.";
        }
    }

    private Map<String, Object> createContentNode(String role, String text) {
        Map<String, Object> contentNode = new HashMap<>();
        contentNode.put("role", role);
        contentNode.put("parts", List.of(Map.of("text", text)));
        return contentNode;
    }
}
