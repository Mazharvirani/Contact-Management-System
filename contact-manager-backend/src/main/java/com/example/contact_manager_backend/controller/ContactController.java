package com.example.contact_manager_backend.controller;

import com.example.contact_manager_backend.dto.ContactRequest;
import com.example.contact_manager_backend.dto.ContactResponse;
import com.example.contact_manager_backend.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contacts")
public class ContactController {

    @Autowired
    private ContactService contactService;


    @PostMapping
    public ResponseEntity<ContactResponse> createContact(
            Authentication auth,
            @RequestBody ContactRequest request) {
        return ResponseEntity.ok(contactService.createContact(auth.getName(), request));
    }


    @GetMapping
    public ResponseEntity<Page<ContactResponse>> getContacts(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(contactService.getContacts(auth.getName(), page, size));
    }


    @GetMapping("/search")
    public ResponseEntity<Page<ContactResponse>> searchContacts(
            Authentication auth,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(contactService.searchContacts(auth.getName(), query, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContact(
            Authentication auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(contactService.getContact(auth.getName(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactResponse> updateContact(
            Authentication auth,
            @PathVariable Long id,
            @RequestBody ContactRequest request) {
        return ResponseEntity.ok(contactService.updateContact(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteContact(
            Authentication auth,
            @PathVariable Long id) {
        contactService.deleteContact(auth.getName(), id);
        return ResponseEntity.ok("Contact deleted successfully");
    }
}