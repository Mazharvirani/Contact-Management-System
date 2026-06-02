package com.example.contact_manager_backend.controller;

import com.example.contact_manager_backend.config.JwtUtil;
import com.example.contact_manager_backend.dto.LoginRequest;
import com.example.contact_manager_backend.dto.RegisterRequest;
import com.example.contact_manager_backend.entity.user;
import com.example.contact_manager_backend.service.UserService;

import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public user register(@RequestBody RegisterRequest request) {
        log.info("New User Registered attempt: {}",request.email);
        user registered = userService.register(request);
        log.info("User registered Successfully: {}",request.email);
        return registered;
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        log.info("Login attempt for: {}", request.identifier);
        boolean success = userService.login(request);
        if(success){
            log.info("login successful for: {}",request.identifier);
            String email = userService.getEmailFromIdentifier(request.identifier);
            return jwtUtil.generateToken(email);
        }else{
            log.warn("login failed for: {}",request.identifier);
            return "invalid credentials";
        }

    }
}