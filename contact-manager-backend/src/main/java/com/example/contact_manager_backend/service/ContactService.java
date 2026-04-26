package com.example.contact_manager_backend.service;

import com.example.contact_manager_backend.dto.ContactRequest;
import com.example.contact_manager_backend.dto.ContactResponse;
import com.example.contact_manager_backend.entity.Contact;
import com.example.contact_manager_backend.entity.EmailEntry;
import com.example.contact_manager_backend.entity.PhoneEntry;
import com.example.contact_manager_backend.entity.user;
import com.example.contact_manager_backend.repository.ContactRepository;
import com.example.contact_manager_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private UserRepository userRepository;

    public ContactResponse createContact(String email, ContactRequest request) {
        user owner = userRepository.findByEmail(email).get();

        Contact contact = new Contact();
        contact.setFirstName(request.firstName);
        contact.setLastName(request.lastName);
        contact.setTitle(request.title);
        contact.setOwner(owner);

        // Map emails
        List<EmailEntry> emails = request.emails.stream().map(e -> {
            EmailEntry entry = new EmailEntry();
            entry.setEmail(e.email);
            entry.setLabel(e.label);
            entry.setContact(contact);
            return entry;
        }).collect(Collectors.toList());
        contact.setEmails(emails);

        List<PhoneEntry> phones = request.phones.stream().map(p -> {
            PhoneEntry entry = new PhoneEntry();
            entry.setPhone(p.Phone);
            entry.setLabel(p.label);
            entry.setContact(contact);
            return entry;
        }).collect(Collectors.toList());
        contact.setPhones(phones);

        return toResponse(contactRepository.save(contact));
    }
    public Page<ContactResponse> getContacts(String email, int page, int size) {
        return contactRepository.findByOwnerEmail(email, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public Page<ContactResponse> searchContacts(String email, String query, int page, int size) {
        return contactRepository
                .findByOwnerEmailAndFirstNameContainingIgnoreCaseOrOwnerEmailAndLastNameContainingIgnoreCase(
                        email, query, email, query, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public ContactResponse getContact(String email, Long id) {
        Contact contact = contactRepository.findById(id)
                .filter(c -> c.getOwner().getEmail().equals(email))
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        return toResponse(contact);
    }

    public ContactResponse updateContact(String email, Long id, ContactRequest request) {
        Contact contact = contactRepository.findById(id)
                .filter(c -> c.getOwner().getEmail().equals(email))
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        contact.setFirstName(request.firstName);
        contact.setLastName(request.lastName);
        contact.setTitle(request.title);

        contact.getEmails().clear();
        request.emails.forEach(e -> {
            EmailEntry entry = new EmailEntry();
            entry.setEmail(e.email);
            entry.setLabel(e.label);
            entry.setContact(contact);
            contact.getEmails().add(entry);
        });

        contact.getPhones().clear();
        request.phones.forEach(p -> {
            PhoneEntry entry = new PhoneEntry();
            entry.setPhone(p.Phone);
            entry.setLabel(p.label);
            entry.setContact(contact);
            contact.getPhones().add(entry);
        });

        return toResponse(contactRepository.save(contact));
    }

    public void deleteContact(String email, Long id) {
        Contact contact = contactRepository.findById(id)
                .filter(c -> c.getOwner().getEmail().equals(email))
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        contactRepository.delete(contact);
    }

    private ContactResponse toResponse(Contact contact) {
        ContactResponse response = new ContactResponse();
        response.id = contact.getId();
        response.firstName = contact.getFirstName();
        response.lastName = contact.getLastName();
        response.title = contact.getTitle();

        response.emails = contact.getEmails().stream().map(e -> {
            ContactResponse.EmailDto dto = new ContactResponse.EmailDto();
            dto.email = e.getEmail();
            dto.label = e.getLabel();
            return dto;
        }).collect(Collectors.toList());

        response.phones = contact.getPhones().stream().map(p -> {
            ContactResponse.PhoneDto dto = new ContactResponse.PhoneDto();
            dto.phone = p.getPhone();
            dto.label = p.getLabel();
            return dto;
        }).collect(Collectors.toList());

        return response;
    }
}