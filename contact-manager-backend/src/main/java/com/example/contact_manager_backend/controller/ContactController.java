package com.example.contact_manager_backend.controller;

import com.example.contact_manager_backend.dto.ContactRequest;
import com.example.contact_manager_backend.dto.ContactResponse;
import com.example.contact_manager_backend.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/contacts")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    @Autowired
    private ContactService contactService;


    @PostMapping
    public ResponseEntity<ContactResponse> createContact(
            Authentication auth,
    @RequestBody ContactRequest request){
        log.info("Creating contact for user: {}", auth.getName());
        ContactResponse response = contactService.createContact(auth.getName(),request);
        log.info("Contact created with id: {}", response.id);
        return ResponseEntity.ok(response);
    }



    @GetMapping
    public ResponseEntity<Page<ContactResponse>> getContacts(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Fetching contacts for user: {}", auth.getName());
        return ResponseEntity.ok(contactService.getContacts(auth.getName(), page, size));
    }


    @GetMapping("/search")
    public ResponseEntity<Page<ContactResponse>> searchContacts(
            Authentication auth,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Searching contacts for user: {} with query: {}", auth.getName(), query);
        return ResponseEntity.ok(contactService.searchContacts(auth.getName(), query, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContact(
            Authentication auth,
            @PathVariable Long id) {
        log.info("Fetching contact id: {} for user: {}", id, auth.getName());
        return ResponseEntity.ok(contactService.getContact(auth.getName(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactResponse> updateContact(
            Authentication auth,
            @PathVariable Long id,
            @RequestBody ContactRequest request) {
        log.info("Updating contact id: {} for user: {}", id, auth.getName());
        return ResponseEntity.ok(contactService.updateContact(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteContact(
            Authentication auth,
            @PathVariable Long id) {
        log.info("Deleting contact id: {} for user: {}", id, auth.getName());
        contactService.deleteContact(auth.getName(), id);
        return ResponseEntity.ok("Contact deleted successfully");
    }
}