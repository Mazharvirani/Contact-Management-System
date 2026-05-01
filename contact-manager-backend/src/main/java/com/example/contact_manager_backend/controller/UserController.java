package com.example.contact_manager_backend.controller;

import com.example.contact_manager_backend.dto.ChangePasswordRequest;
import com.example.contact_manager_backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@RestController
@RequestMapping("/user")
public class UserController {
    private static  final Logger log= LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        log.info("Change password attempt for: {}", request.identifier);
        String result = userService.changePassword(request);

        if (result.equals("password updated")) {
            log.info("Password changed successfully for: {}", request.identifier);
            return ResponseEntity.ok(result);
        } else {
            log.warn("Password change failed for: {}", request.identifier);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
    }
}