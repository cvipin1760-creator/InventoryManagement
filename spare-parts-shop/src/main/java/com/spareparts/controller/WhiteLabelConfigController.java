package com.spareparts.controller;

import com.spareparts.model.WhiteLabelConfig;
import com.spareparts.service.WhiteLabelConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/whitelabel")
@RequiredArgsConstructor
public class WhiteLabelConfigController {

    private final WhiteLabelConfigService whiteLabelConfigService;

    @GetMapping
    public ResponseEntity<WhiteLabelConfig> getConfig() {
        return ResponseEntity.ok(whiteLabelConfigService.getConfig());
    }

    @PutMapping
    public ResponseEntity<WhiteLabelConfig> updateConfig(@RequestBody WhiteLabelConfig request) {
        return ResponseEntity.ok(whiteLabelConfigService.updateConfig(request));
    }
}
