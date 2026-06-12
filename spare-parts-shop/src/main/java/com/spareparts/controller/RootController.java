package com.spareparts.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, Object> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "StockPilot API is running");
        return response;
    }

    @GetMapping("/api")
    public Map<String, Object> apiRoot() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "StockPilot API is running");
        return response;
    }
}
