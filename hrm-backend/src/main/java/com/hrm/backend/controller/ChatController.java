package com.hrm.backend.controller;

import com.hrm.backend.dto.ChatRequest;
import com.hrm.backend.dto.ChatResponse;
import com.hrm.backend.entity.Employee;
import com.hrm.backend.repository.EmployeeRepository;
import com.hrm.backend.security.UserPrincipal;
import com.hrm.backend.service.ChatContextService;
import com.hrm.backend.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final GeminiService geminiService;
    private final ChatContextService chatContextService;
    private final EmployeeRepository employeeRepository;

    public ChatController(GeminiService geminiService,
                          ChatContextService chatContextService,
                          EmployeeRepository employeeRepository) {
        this.geminiService = geminiService;
        this.chatContextService = chatContextService;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/employee/chat")
    public ResponseEntity<ChatResponse> employeeChat(@AuthenticationPrincipal UserPrincipal currentUser,
                                                     @RequestBody ChatRequest request) {
        Long employeeId = null;
        if (currentUser != null) {
            Optional<Employee> empOpt = employeeRepository.findByUserId(currentUser.getId());
            if (empOpt.isPresent()) {
                employeeId = empOpt.get().getId();
            }
        }

        String context = chatContextService.buildEmployeeContext(employeeId);
        String systemPrompt = "You are a helpful HR assistant for this company's HR portal. " +
                "Answer the employee's questions about leave, timesheets, and general HR policy in a friendly, concise way (2-4 sentences max unless more detail is clearly needed). " +
                "Use this real-time data about the employee when relevant to their question: " + context + ". " +
                "Common policies: leave requests need manager approval, timesheets are submitted weekly, contact HR for anything outside what you know. " +
                "If asked something completely unrelated to HR/this portal, politely redirect them back to HR topics. " +
                "Never invent leave balances or data you weren't given.";

        String reply = geminiService.getReply(systemPrompt, request.getMessage(), request.getHistory());
        return ResponseEntity.ok(new ChatResponse(reply));
    }

    @PostMapping("/admin/chat")
    public ResponseEntity<ChatResponse> adminChat(@AuthenticationPrincipal UserPrincipal currentUser,
                                                  @RequestBody ChatRequest request) {
        String context = chatContextService.buildAdminContext();
        String systemPrompt = "You are a helpful HR assistant for company administrators in this HR portal. " +
                "Answer the admin's questions about company metrics, leave approvals, timesheet verifications, recruitment, and HR policies in a helpful, concise way (2-4 sentences max unless more detail is clearly needed). " +
                "Use this real-time administrative summary data when relevant: " + context + ". " +
                "You can assist with checking pending counts, drafting policy text, summarizing recruitment status, or explaining HR administrative procedures. " +
                "If asked something completely unrelated to HR/this portal, politely redirect them back to HR topics. " +
                "Never invent company metrics or data you weren't given.";

        String reply = geminiService.getReply(systemPrompt, request.getMessage(), request.getHistory());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
