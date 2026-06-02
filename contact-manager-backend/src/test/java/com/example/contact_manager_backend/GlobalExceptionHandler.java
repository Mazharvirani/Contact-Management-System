package com.example.contact_manager_backend;

import com.example.contact_manager_backend.config.GlobalExceptionHandler;
import com.example.contact_manager_backend.exception.DuplicateResourceException;
import com.example.contact_manager_backend.exception.ResourceNotFoundException;
import com.example.contact_manager_backend.exception.UnauthorizedException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    @Test
    void testHandleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Contact not found");
        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleResourceNotFound(ex);

        assertEquals(404, response.getStatusCode().value());
        assertEquals("Contact not found", response.getBody().get("message"));
    }

    @Test
    void testHandleUnauthorizedException() {
        UnauthorizedException ex = new UnauthorizedException("Unauthorized access");
        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleUnauthorized(ex);

        assertEquals(401, response.getStatusCode().value());
        assertEquals("Unauthorized access", response.getBody().get("message"));
    }

    @Test
    void testHandleDuplicateResourceException() {
        DuplicateResourceException ex = new DuplicateResourceException("Email already exists");
        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleDuplicate(ex);

        assertEquals(409, response.getStatusCode().value());
        assertEquals("Email already exists", response.getBody().get("message"));
    }

    @Test
    void testHandleRuntimeException() {
        RuntimeException ex = new RuntimeException("Runtime error");
        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleRuntimeException(ex);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Runtime error", response.getBody().get("message"));
    }

    @Test
    void testHandleGeneralException() {
        Exception ex = new Exception("General error");
        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleGeneralException(ex);

        assertEquals(500, response.getStatusCode().value());
        assertEquals("Something went wrong. Please try again.", response.getBody().get("message"));
    }

    @Test
    void testHandleIllegalArgumentException() {
        IllegalArgumentException ex = new IllegalArgumentException("Illegal argument");
        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleIllegalArgument(ex);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Illegal argument", response.getBody().get("message"));
    }
}