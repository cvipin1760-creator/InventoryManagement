package com.spareparts.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final KeepAliveWebSocketHandler keepAliveWebSocketHandler;

    public WebSocketConfig(KeepAliveWebSocketHandler keepAliveWebSocketHandler) {
        this.keepAliveWebSocketHandler = keepAliveWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(keepAliveWebSocketHandler, "/ws/keep-alive")
                .setAllowedOrigins("*");
    }
}
