package com.example.contact_manager_backend;

import com.example.contact_manager_backend.dto.ChangePasswordRequest;
import com.example.contact_manager_backend.dto.LoginRequest;
import com.example.contact_manager_backend.dto.RegisterRequest;
import com.example.contact_manager_backend.entity.user;
import com.example.contact_manager_backend.exception.DuplicateResourceException;
import com.example.contact_manager_backend.exception.ResourceNotFoundException;
import com.example.contact_manager_backend.exception.UnauthorizedException;
import com.example.contact_manager_backend.repository.UserRepository;
import com.example.contact_manager_backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private user testUser;

    @BeforeEach
    void setUp() {
        testUser = new user();
        testUser.setName("Mazhar");
        testUser.setEmail("mazhar@gmail.com");
        testUser.setPhone("03001234567");
        testUser.setPassword("encodedPassword");
        testUser.setRole("USER");
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.name = "Mazhar";
        request.email = "mazhar@gmail.com";
        request.phone = "03001234567";
        request.password = "12345";

        when(userRepository.findByEmail(request.email)).thenReturn(Optional.empty());
        when(userRepository.findByPhone(request.phone)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.password)).thenReturn("encodedPassword");
        when(userRepository.save(any(user.class))).thenReturn(testUser);

        user result = userService.register(request);

        assertNotNull(result);
        assertEquals("mazhar@gmail.com", result.getEmail());
        verify(userRepository, times(1)).save(any(user.class));
    }

    @Test
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.email = "mazhar@gmail.com";
        request.phone = "03001234567";

        when(userRepository.findByEmail(request.email)).thenReturn(Optional.of(testUser));

        assertThrows(DuplicateResourceException.class, () -> userService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest();
        request.identifier = "mazhar@gmail.com";
        request.password = "12345";

        when(userRepository.findByEmail(request.identifier)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.password, testUser.getPassword())).thenReturn(true);

        boolean result = userService.login(request);

        assertTrue(result);
    }

    @Test
    void testLoginWrongPassword() {
        LoginRequest request = new LoginRequest();
        request.identifier = "mazhar@gmail.com";
        request.password = "wrongpassword";

        when(userRepository.findByEmail(request.identifier)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.password, testUser.getPassword())).thenReturn(false);

        boolean result = userService.login(request);

        assertFalse(result);
    }

    @Test
    void testLoginUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.identifier = "notfound@gmail.com";
        request.password = "12345";

        when(userRepository.findByEmail(request.identifier)).thenReturn(Optional.empty());
        when(userRepository.findByPhone(request.identifier)).thenReturn(Optional.empty());

        boolean result = userService.login(request);

        assertFalse(result);
    }

    @Test
    void testChangePasswordSuccess() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setIdentifier("mazhar@gmail.com");
        request.setOldPassword("12345");
        request.setNewPassword("99999");

        when(userRepository.findByEmail(request.getIdentifier())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getOldPassword(), testUser.getPassword())).thenReturn(true);
        when(passwordEncoder.encode(request.getNewPassword())).thenReturn("newEncodedPassword");
        when(userRepository.save(any(user.class))).thenReturn(testUser);

        String result = userService.changePassword(request);

        assertEquals("password updated", result);
        verify(userRepository, times(1)).save(any(user.class));
    }

    @Test
    void testChangePasswordWrongOldPassword() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setIdentifier("mazhar@gmail.com");
        request.setOldPassword("wrongpassword");
        request.setNewPassword("99999");

        when(userRepository.findByEmail(request.getIdentifier())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getOldPassword(), testUser.getPassword())).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> userService.changePassword(request));
    }

    @Test
    void testChangePasswordUserNotFound() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setIdentifier("notfound@gmail.com");
        request.setOldPassword("12345");
        request.setNewPassword("99999");

        when(userRepository.findByEmail(request.getIdentifier())).thenReturn(Optional.empty());
        when(userRepository.findByPhone(request.getIdentifier())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.changePassword(request));
    }
}