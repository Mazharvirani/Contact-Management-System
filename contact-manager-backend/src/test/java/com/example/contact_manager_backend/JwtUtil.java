package com.example.contact_manager_backend;

import com.example.contact_manager_backend.config.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secretKey",
                "mysecretkeymysecretkeymysecretkey123456789012");
    }

    @Test
    void testGenerateToken() {
        String token = jwtUtil.generateToken("mazhar@gmail.com");
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void testExtractEmail() {
        String token = jwtUtil.generateToken("mazhar@gmail.com");
        String email = jwtUtil.extractEmail(token);
        assertEquals("mazhar@gmail.com", email);
    }

    @Test
    void testValidateToken() {
        String token = jwtUtil.generateToken("mazhar@gmail.com");
        boolean valid = jwtUtil.validateToken(token, "mazhar@gmail.com");
        assertTrue(valid);
    }

    @Test
    void testValidateTokenWrongEmail() {
        String token = jwtUtil.generateToken("mazhar@gmail.com");
        boolean valid = jwtUtil.validateToken(token, "other@gmail.com");
        assertFalse(valid);
    }
}