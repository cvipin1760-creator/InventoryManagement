package com.spareparts.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final KeepAliveWebSocketHandler keepAliveWebSocketHandler;
    private final InventoryWebSocketHandler inventoryWebSocketHandler;
    private final QueueWebSocketHandler queueWebSocketHandler;

    public WebSocketConfig(KeepAliveWebSocketHandler keepAliveWebSocketHandler, 
                           InventoryWebSocketHandler inventoryWebSocketHandler,
                           QueueWebSocketHandler queueWebSocketHandler) {
        this.keepAliveWebSocketHandler = keepAliveWebSocketHandler;
        this.inventoryWebSocketHandler = inventoryWebSocketHandler;
        this.queueWebSocketHandler = queueWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(keepAliveWebSocketHandler, "/ws/keep-alive")
                .setAllowedOrigins("*");
        registry.addHandler(inventoryWebSocketHandler, "/ws/inventory")
                .setAllowedOrigins("*");
        registry.addHandler(queueWebSocketHandler, "/ws/queue")
                .setAllowedOrigins("*");
    }
}
