package com.example.contact_manager_backend;

import com.example.contact_manager_backend.config.JwtUtil;
import com.example.contact_manager_backend.dto.LoginRequest;
import com.example.contact_manager_backend.dto.RegisterRequest;
import com.example.contact_manager_backend.entity.user;
import com.example.contact_manager_backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.example.contact_manager_backend.controller.AuthController;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthController authController;

    @Test
    void testRegister() {
        RegisterRequest request = new RegisterRequest();
        request.name = "Mazhar";
        request.email = "mazhar@gmail.com";
        request.phone = "03001234567";
        request.password = "12345";

        user mockUser = new user();
        mockUser.setEmail("mazhar@gmail.com");

        when(userService.register(request)).thenReturn(mockUser);

        user result = authController.register(request);

        assertNotNull(result);
        assertEquals("mazhar@gmail.com", result.getEmail());
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest();
        request.identifier = "mazhar@gmail.com";
        request.password = "12345";

        when(userService.login(request)).thenReturn(true);
        when(userService.getEmailFromIdentifier(request.identifier)).thenReturn("mazhar@gmail.com");
        when(jwtUtil.generateToken("mazhar@gmail.com")).thenReturn("mock.jwt.token");

        String result = authController.login(request);

        assertEquals("mock.jwt.token", result);
    }

    @Test
    void testLoginFailure() {
        LoginRequest request = new LoginRequest();
        request.identifier = "mazhar@gmail.com";
        request.password = "wrongpassword";

        when(userService.login(request)).thenReturn(false);

        String result = authController.login(request);

        assertEquals("invalid credentials", result);
    }
    @Test
    void testLoginWithPhone() {
        LoginRequest request = new LoginRequest();
        request.identifier = "03001234567";
        request.password = "12345";

        when(userService.login(request)).thenReturn(true);
        when(userService.getEmailFromIdentifier(request.identifier)).thenReturn("mazhar@gmail.com");
        when(jwtUtil.generateToken("mazhar@gmail.com")).thenReturn("mock.jwt.token");

        String result = authController.login(request);

        assertEquals("mock.jwt.token", result);
    }
    @Test
    void testRegisterWithDifferentUser() {
        RegisterRequest request = new RegisterRequest();
        request.name = "Ali";
        request.email = "ali@gmail.com";
        request.phone = "03009876543";
        request.password = "password123";

        user mockUser = new user();
        mockUser.setEmail("ali@gmail.com");
        mockUser.setName("Ali");

        when(userService.register(request)).thenReturn(mockUser);

        user result = authController.register(request);

        assertNotNull(result);
        assertEquals("ali@gmail.com", result.getEmail());
        assertEquals("Ali", result.getName());
    }
}