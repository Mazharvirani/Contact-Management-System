package com.example.contact_manager_backend.service;

import com.example.contact_manager_backend.dto.LoginRequest;
import com.example.contact_manager_backend.dto.RegisterRequest;
import com.example.contact_manager_backend.dto.ChangePasswordRequest;
import com.example.contact_manager_backend.dto.UserProfileResponse;
import com.example.contact_manager_backend.entity.user;
import com.example.contact_manager_backend.exception.DuplicateResourceException;
import com.example.contact_manager_backend.exception.ResourceNotFoundException;
import com.example.contact_manager_backend.exception.UnauthorizedException;
import com.example.contact_manager_backend.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public user register(RegisterRequest request) {
        log.info("Registering user with email: {}", request.email);

        if (userRepository.findByEmail(request.email).isPresent()) {
            log.warn("Email already registered: {}", request.email);
            throw new DuplicateResourceException("Email already registered: " + request.email);
        }

        if (userRepository.findByPhone(request.phone).isPresent()) {
            log.warn("Phone already registered: {}", request.phone);
            throw new DuplicateResourceException("Phone already registered: " + request.phone);
        }

        user user = new user();
        user.setName(request.name);
        user.setEmail(request.email);
        user.setPhone(request.phone);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setRole("USER");

        user saved = userRepository.save(user);
        log.info("User registered successfully: {}", request.email);
        return saved;
    }

    public boolean login(LoginRequest request) {
        log.info("Login attempt for: {}", request.identifier);

        Optional<user> user = userRepository.findByEmail(request.identifier);
        if (user.isEmpty()) {
            user = userRepository.findByPhone(request.identifier);
        }

        if (user.isPresent()) {
            boolean matches = passwordEncoder.matches(request.password, user.get().getPassword());
            if (matches) {
                log.info("Login successful for: {}", request.identifier);
            } else {
                log.warn("Invalid password for: {}", request.identifier);
            }
            return matches;
        }

        log.warn("User not found for: {}", request.identifier);
        return false;
    }

    public String changePassword(ChangePasswordRequest request) {
        log.info("Change password attempt for: {}", request.getIdentifier());

        Optional<user> userOpt = userRepository.findByEmail(request.getIdentifier());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhone(request.getIdentifier());
        }

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", request.getIdentifier());
            throw new ResourceNotFoundException("User not found: " + request.getIdentifier());
        }

        user user = userOpt.get();
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            log.warn("Old password incorrect for: {}", request.getIdentifier());
            throw new UnauthorizedException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for: {}", request.getIdentifier());
        return "password updated";
    }

    public String getEmailFromIdentifier(String identifier) {
        Optional<user> user = userRepository.findByEmail(identifier);
        if (user.isEmpty()) {
            user = userRepository.findByPhone(identifier);
        }
        return user.map(u -> u.getEmail()).orElse(null);
    }
    public UserProfileResponse getprofile(String email){
        log.info("fetching profile for: {} ",email);
        user u = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        UserProfileResponse response = new UserProfileResponse();
        response.setId(u.getId());
        response.setName(u.getName());
        response.setEmail(u.getEmail());
        response.setPhone(u.getPhone());
        response.setRole(u.getRole());

        return response;
    }
}