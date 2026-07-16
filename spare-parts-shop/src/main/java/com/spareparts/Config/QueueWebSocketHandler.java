package com.spareparts.Config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class QueueWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(QueueWebSocketHandler.class);
    
    // businessId -> list of active sessions
    private final Map<Long, List<WebSocketSession>> businessSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logger.info("Queue WebSocket connected: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        try {
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            if ("subscribe".equals(data.get("action")) && data.get("businessId") != null) {
                Long businessId = Long.valueOf(data.get("businessId").toString());
                businessSessions.computeIfAbsent(businessId, k -> new CopyOnWriteArrayList<>()).add(session);
                session.getAttributes().put("businessId", businessId);
                logger.info("Session {} subscribed to queue for business {}", session.getId(), businessId);
            }
        } catch (Exception e) {
            logger.error("Failed to parse websocket message", e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long businessId = (Long) session.getAttributes().get("businessId");
        if (businessId != null) {
            List<WebSocketSession> sessions = businessSessions.get(businessId);
            if (sessions != null) {
                sessions.remove(session);
            }
        }
        logger.info("Queue WebSocket closed: {}", session.getId());
    }

    public void broadcastUpdate(Long businessId, Object payload) {
        List<WebSocketSession> sessions = businessSessions.get(businessId);
        if (sessions != null && !sessions.isEmpty()) {
            try {
                String messageStr = objectMapper.writeValueAsString(payload);
                TextMessage message = new TextMessage(messageStr);
                for (WebSocketSession session : sessions) {
                    if (session.isOpen()) {
                        try {
                            session.sendMessage(message);
                        } catch (IOException e) {
                            logger.error("Failed to send queue message to session {}", session.getId(), e);
                        }
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to serialize queue update", e);
            }
        }
    }
}
