package com.spareparts.controller;

import com.spareparts.model.Business;
import com.spareparts.model.User;
import com.spareparts.repository.UserRepository;
import com.spareparts.service.BusinessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/business")
@CrossOrigin(origins = "*")
public class BusinessController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessService businessService;

    @GetMapping
    public ResponseEntity<Business> getCurrentBusiness(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        if (user.getBusiness() != null) {
            return ResponseEntity.ok(user.getBusiness());
        } else {
            return ResponseEntity.status(404).build();
        }
    }
}
