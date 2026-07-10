package com.spareparts.controller;

import com.spareparts.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
@Slf4j
public class WhatsAppController {

    private final WhatsAppService whatsAppService;

    // Twilio sends data as application/x-www-form-urlencoded
    @PostMapping(value = "/whatsapp", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE, produces = MediaType.APPLICATION_XML_VALUE)
    public String receiveWhatsAppMessage(
            @RequestParam("From") String from,
            @RequestParam("Body") String body) {
        
        log.info("Received WhatsApp message from {}: {}", from, body);
        
        String replyText = whatsAppService.handleIncomingMessage(from, body);
        
        // Return Twilio TwiML response format
        return "<Response><Message>" + escapeXml(replyText) + "</Message></Response>";
    }

    private String escapeXml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;");
    }
}
