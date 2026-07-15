package com.spareparts.controller;

import com.spareparts.dto.ChatRequest;
import com.spareparts.dto.ChatResponse;
import com.spareparts.model.User;
import com.spareparts.repository.UserRepository;
import com.spareparts.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired
    private AIService aiService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String context = "You are StockPilot's AI Assistant. " +
                "You help users manage their inventory, bills, and customers. " +
                "The current user is '" + user.getUsername() + "' with the role '" + user.getRole() + "'. " +
                "Be concise, helpful, and professional.";

        String aiReply = aiService.getAIResponse(request.getMessage(), context);
        return ResponseEntity.ok(new ChatResponse(aiReply));
    }
}
