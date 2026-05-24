package com.example.contact_manager_backend;

import com.example.contact_manager_backend.dto.ContactRequest;
import com.example.contact_manager_backend.dto.ContactResponse;
import com.example.contact_manager_backend.entity.Contact;
import com.example.contact_manager_backend.entity.user;
import com.example.contact_manager_backend.exception.ResourceNotFoundException;
import com.example.contact_manager_backend.repository.ContactRepository;
import com.example.contact_manager_backend.repository.UserRepository;
import com.example.contact_manager_backend.service.ContactService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
 class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ContactService contactService;

    private user testUser;
    private Contact testContact;
    private ContactRequest testRequest;

    @BeforeEach
    void setUp() {
        testUser = new user();
        testUser.setEmail("mazhar@gmail.com");
        testUser.setName("Mazhar");

        testContact = new Contact();
        testContact.setId(1L);
        testContact.setFirstName("John");
        testContact.setLastName("Doe");
        testContact.setTitle("Manager");
        testContact.setOwner(testUser);
        testContact.setEmails(new ArrayList<>());
        testContact.setPhones(new ArrayList<>());

        testRequest = new ContactRequest();
        testRequest.firstName = "John";
        testRequest.lastName = "Doe";
        testRequest.title = "Manager";
        testRequest.emails = new ArrayList<>();
        testRequest.phones = new ArrayList<>();
    }

    @Test
    void testCreateContactSuccess() {
        when(userRepository.findByEmail("mazhar@gmail.com")).thenReturn(Optional.of(testUser));
        when(contactRepository.save(any(Contact.class))).thenReturn(testContact);

        ContactResponse response = contactService.createContact("mazhar@gmail.com", testRequest);

        assertNotNull(response);
        assertEquals("John", response.firstName);
        assertEquals("Doe", response.lastName);
        verify(contactRepository, times(1)).save(any(Contact.class));
    }

    @Test
    void testCreateContactUserNotFound() {
        when(userRepository.findByEmail("notfound@gmail.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> contactService.createContact("notfound@gmail.com", testRequest));
    }

    @Test
    void testGetContacts() {
        List<Contact> contacts = List.of(testContact);
        Page<Contact> page = new PageImpl<>(contacts);

        when(contactRepository.findByOwnerEmail("mazhar@gmail.com", PageRequest.of(0, 10)))
                .thenReturn(page);

        Page<ContactResponse> result = contactService.getContacts("mazhar@gmail.com", 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("John", result.getContent().get(0).firstName);
    }

    @Test
    void testGetContactSuccess() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));

        ContactResponse response = contactService.getContact("mazhar@gmail.com", 1L);

        assertNotNull(response);
        assertEquals("John", response.firstName);
    }

    @Test
    void testGetContactNotFound() {
        when(contactRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> contactService.getContact("mazhar@gmail.com", 99L));
    }

    @Test
    void testGetContactWrongUser() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));

        assertThrows(ResourceNotFoundException.class,
                () -> contactService.getContact("other@gmail.com", 1L));
    }

    @Test
    void testUpdateContactSuccess() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));
        when(contactRepository.save(any(Contact.class))).thenReturn(testContact);

        testRequest.firstName = "John Updated";
        ContactResponse response = contactService.updateContact("mazhar@gmail.com", 1L, testRequest);

        assertNotNull(response);
        verify(contactRepository, times(1)).save(any(Contact.class));
    }

    @Test
    void testUpdateContactNotFound() {
        when(contactRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> contactService.updateContact("mazhar@gmail.com", 99L, testRequest));
    }

    @Test
    void testDeleteContactSuccess() {
        when(contactRepository.findById(1L)).thenReturn(Optional.of(testContact));

        contactService.deleteContact("mazhar@gmail.com", 1L);

        verify(contactRepository, times(1)).delete(testContact);
    }

    @Test
    void testDeleteContactNotFound() {
        when(contactRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> contactService.deleteContact("mazhar@gmail.com", 99L));
    }
    @Test
    void testSearchContacts() {
        List<Contact> contacts = List.of(testContact);
        Page<Contact> page = new PageImpl<>(contacts);

        when(contactRepository
                .findByOwnerEmailAndFirstNameContainingIgnoreCaseOrOwnerEmailAndLastNameContainingIgnoreCase(
                        "mazhar@gmail.com", "john",
                        "mazhar@gmail.com", "john",
                        PageRequest.of(0, 10)))
                .thenReturn(page);

        Page<ContactResponse> result = contactService.searchContacts("mazhar@gmail.com", "john", 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void testCreateContactWithEmailsAndPhones() {
        when(userRepository.findByEmail("mazhar@gmail.com")).thenReturn(Optional.of(testUser));

        ContactRequest.EmailDto emailDto = new ContactRequest.EmailDto();
        emailDto.email = "john@work.com";
        emailDto.label = "work";

        ContactRequest.PhoneDto phoneDto = new ContactRequest.PhoneDto();
        phoneDto.setPhone("03001234567");
        phoneDto.setLabel("home");

        testRequest.emails = List.of(emailDto);
        testRequest.phones = List.of(phoneDto);

        when(contactRepository.save(any(Contact.class))).thenReturn(testContact);

        ContactResponse response = contactService.createContact("mazhar@gmail.com", testRequest);

        assertNotNull(response);
        verify(contactRepository, times(1)).save(any(Contact.class));
    }
}