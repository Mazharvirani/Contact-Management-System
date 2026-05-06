package com.example.contact_manager_backend.controller;

import com.example.contact_manager_backend.dto.ChangePasswordRequest;
import com.example.contact_manager_backend.dto.UserProfileResponse;
import com.example.contact_manager_backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        log.info("Change password request for: {}", request.identifier);
        userService.changePassword(request);
        return ResponseEntity.ok("Password changed successfully");
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication auth) {
        log.info("Profile request for: {}", auth.getName());
        return ResponseEntity.ok(userService.getprofile(auth.getName()));
    }
}