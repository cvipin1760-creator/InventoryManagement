package com.spareparts.controller;

import com.spareparts.model.AuditTask;
import com.spareparts.service.AuditTaskService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/audit-tasks")
@RequiredArgsConstructor
public class AuditTaskController {
    private final AuditTaskService auditTaskService;

    @GetMapping
    public ResponseEntity<List<AuditTask>> getAllTasks() {
        return ResponseEntity.ok(auditTaskService.getAllAuditTasks());
    }

    @PostMapping
    public ResponseEntity<AuditTask> createTask(@RequestBody CreateTaskRequest request, Principal principal) {
        return ResponseEntity.ok(auditTaskService.createAuditTask(request.getProductId(), principal.getName()));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<AuditTask> completeTask(@PathVariable Long id, @RequestBody CompleteTaskRequest request) {
        return ResponseEntity.ok(auditTaskService.completeAuditTask(id, request.getActualQuantity()));
    }

    @Data
    public static class CreateTaskRequest {
        private Long productId;
    }

    @Data
    public static class CompleteTaskRequest {
        private Integer actualQuantity;
    }
}
