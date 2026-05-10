package com.example.contact_manager_backend;

import com.example.contact_manager_backend.controller.ContactController;
import com.example.contact_manager_backend.dto.ContactRequest;
import com.example.contact_manager_backend.dto.ContactResponse;
import com.example.contact_manager_backend.service.ContactService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactControllerTest {

    @Mock
    private ContactService contactService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ContactController contactController;

    @Test
    void testCreateContact() {
        when(authentication.getName()).thenReturn("mazhar@gmail.com");

        ContactRequest request = new ContactRequest();
        request.firstName = "John";
        request.lastName = "Doe";
        request.title = "Manager";
        request.emails = new ArrayList<>();
        request.phones = new ArrayList<>();

        ContactResponse mockResponse = new ContactResponse();
        mockResponse.id = 1L;
        mockResponse.firstName = "John";
        mockResponse.lastName = "Doe";

        when(contactService.createContact("mazhar@gmail.com", request)).thenReturn(mockResponse);

        ResponseEntity<ContactResponse> response = contactController.createContact(authentication, request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("John", response.getBody().firstName);
    }

    @Test
    void testGetContacts() {
        when(authentication.getName()).thenReturn("mazhar@gmail.com");

        ContactResponse mockContact = new ContactResponse();
        mockContact.id = 1L;
        mockContact.firstName = "John";

        List<ContactResponse> contacts = List.of(mockContact);
        Page<ContactResponse> page = new PageImpl<>(contacts);

        when(contactService.getContacts("mazhar@gmail.com", 0, 10)).thenReturn(page);

        ResponseEntity<Page<ContactResponse>> response = contactController.getContacts(authentication, 0, 10);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().getTotalElements());
    }

    @Test
    void testSearchContacts() {
        when(authentication.getName()).thenReturn("mazhar@gmail.com");

        Page<ContactResponse> page = new PageImpl<>(new ArrayList<>());
        when(contactService.searchContacts("mazhar@gmail.com", "john", 0, 10)).thenReturn(page);

        ResponseEntity<Page<ContactResponse>> response = contactController.searchContacts(authentication, "john", 0, 10);

        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testGetContact() {
        when(authentication.getName()).thenReturn("mazhar@gmail.com");

        ContactResponse mockResponse = new ContactResponse();
        mockResponse.id = 1L;
        mockResponse.firstName = "John";

        when(contactService.getContact("mazhar@gmail.com", 1L)).thenReturn(mockResponse);

        ResponseEntity<ContactResponse> response = contactController.getContact(authentication, 1L);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("John", response.getBody().firstName);
    }

    @Test
    void testUpdateContact() {
        when(authentication.getName()).thenReturn("mazhar@gmail.com");

        ContactRequest request = new ContactRequest();
        request.firstName = "John Updated";
        request.emails = new ArrayList<>();
        request.phones = new ArrayList<>();

        ContactResponse mockResponse = new ContactResponse();
        mockResponse.id = 1L;
        mockResponse.firstName = "John Updated";

        when(contactService.updateContact("mazhar@gmail.com", 1L, request)).thenReturn(mockResponse);

        ResponseEntity<ContactResponse> response = contactController.updateContact(authentication, 1L, request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("John Updated", response.getBody().firstName);
    }

    @Test
    void testDeleteContact() {
        when(authentication.getName()).thenReturn("mazhar@gmail.com");

        doNothing().when(contactService).deleteContact("mazhar@gmail.com", 1L);

        ResponseEntity<String> response = contactController.deleteContact(authentication, 1L);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Contact deleted successfully", response.getBody());
    }
}