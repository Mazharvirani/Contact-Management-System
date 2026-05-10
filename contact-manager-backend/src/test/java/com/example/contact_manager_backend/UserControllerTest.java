package com.example.contact_manager_backend;

import com.example.contact_manager_backend.controller.UserController;
import com.example.contact_manager_backend.dto.ChangePasswordRequest;
import com.example.contact_manager_backend.dto.UserProfileResponse;
import com.example.contact_manager_backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserController userController;

    @Test
    void testChangePassword() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setIdentifier("mazhar@gmail.com");
        request.setOldPassword("12345");
        request.setNewPassword("99999");

        when(userService.changePassword(request)).thenReturn("password updated");

        ResponseEntity<String> response = userController.changePassword(request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Password changed successfully", response.getBody());
    }

    @Test
    void testGetProfile() {
        when(authentication.getName()).thenReturn("mazhar@gmail.com");

        UserProfileResponse mockProfile = new UserProfileResponse();
        mockProfile.setName("Mazhar");
        mockProfile.setEmail("mazhar@gmail.com");

        when(userService.getprofile("mazhar@gmail.com")).thenReturn(mockProfile);

        ResponseEntity<UserProfileResponse> response = userController.getProfile(authentication);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Mazhar", response.getBody().getName());
    }
}