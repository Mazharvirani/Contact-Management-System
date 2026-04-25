package com.example.contact_manager_backend.service;

import com.example.contact_manager_backend.dto.LoginRequest;
import com.example.contact_manager_backend.dto.RegisterRequest;
import com.example.contact_manager_backend.dto.ChangePasswordRequest;
import com.example.contact_manager_backend.entity.user;
import com.example.contact_manager_backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService{
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public user register(RegisterRequest request){
        user user = new user();
        user.setName(request.name);
        user.setEmail(request.email);
        user.setPhone(request.phone);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setRole("USER");

        return userRepository.save(user);
    }
    public boolean login(LoginRequest request) {

        Optional<user> user = userRepository.findByEmail(request.identifier);

        if (user.isEmpty()){
            user = userRepository.findByPhone(request.identifier);
        }
        if(user.isPresent())
        {
            return  passwordEncoder.matches(
                    request.password,user.get().getPassword()
            );
        }
        return false;
    }
    public String changePassword(ChangePasswordRequest request){
        Optional<user> userOpt = userRepository.findByEmail(request.identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhone(request.identifier);
        }

        if(userOpt.isEmpty()){
            return "User not found";
        }
        user user =userOpt.get();
        if(!passwordEncoder.matches(request.oldPassword,user.getPassword())){
            return "old password is incorrect";
        }
        user.setPassword(passwordEncoder.encode(request.newPassword));
        userRepository.save(user);

        return "password updated";
    }
    public String getEmailFromIdentifier(String identifier) {

        Optional<user> user = userRepository.findByEmail(identifier);

        if (user.isEmpty()) {
            user = userRepository.findByPhone(identifier);
        }

        return user.map(u -> u.getEmail()).orElse(null);
    }

}