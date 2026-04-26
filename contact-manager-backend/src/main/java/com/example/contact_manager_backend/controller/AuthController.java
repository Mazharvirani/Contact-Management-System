package com.example.contact_manager_backend.controller;

import com.example.contact_manager_backend.config.JwtUtil;
import com.example.contact_manager_backend.dto.LoginRequest;
import com.example.contact_manager_backend.dto.RegisterRequest;
import com.example.contact_manager_backend.entity.user;
import com.example.contact_manager_backend.service.UserService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public user register(@RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        boolean success = userService.login(request);

        if (success) {
            String email = userService.getEmailFromIdentifier(request.identifier);
            return jwtUtil.generateToken(email);
        } else {
            return "Invalid Credentials";
        }
    }
}