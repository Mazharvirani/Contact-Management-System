package com.example.contact_manager_backend.service;

import com.example.contact_manager_backend.dto.ContactRequest;
import com.example.contact_manager_backend.dto.ContactResponse;
import com.example.contact_manager_backend.entity.Contact;
import com.example.contact_manager_backend.entity.EmailEntry;
import com.example.contact_manager_backend.entity.PhoneEntry;
import com.example.contact_manager_backend.entity.user;
import com.example.contact_manager_backend.exception.ResourceNotFoundException;
import com.example.contact_manager_backend.repository.ContactRepository;
import com.example.contact_manager_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);
    private static final String CONTACT_NOT_FOUND = "Contact not found with id: ";

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private UserRepository userRepository;

    public ContactResponse createContact(String email, ContactRequest request) {
        log.info("Creating contact for user: {}", email);
        user owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Contact contact = new Contact();
        contact.setFirstName(request.firstName);
        contact.setLastName(request.lastName);
        contact.setTitle(request.title);
        contact.setOwner(owner);

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
            entry.setPhone(p.getPhone());
            entry.setLabel(p.getLabel());
            entry.setContact(contact);
            return entry;
        }).collect(Collectors.toList());
        contact.setPhones(phones);

        ContactResponse response = toResponse(contactRepository.save(contact));
        log.info("Contact created with id: {}", response.id);
        return response;
    }

    public Page<ContactResponse> getContacts(String email, int page, int size) {
        log.info("Fetching contacts for user: {}", email);
        return contactRepository.findByOwnerEmail(email, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public Page<ContactResponse> searchContacts(String email, String query, int page, int size) {
        log.info("Searching contacts for user: {} with query: {}", email, query);
        return contactRepository
                .findByOwnerEmailAndFirstNameContainingIgnoreCaseOrOwnerEmailAndLastNameContainingIgnoreCase(
                        email, query, email, query, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public ContactResponse getContact(String email, Long id) {
        log.info("Fetching contact id: {} for user: {}", id, email);
        Contact contact = contactRepository.findById(id)
                .filter(c -> c.getOwner().getEmail().equals(email))
                .orElseThrow(() -> new ResourceNotFoundException(CONTACT_NOT_FOUND + id));
        return toResponse(contact);
    }

    public ContactResponse updateContact(String email, Long id, ContactRequest request) {
        log.info("Updating contact id: {} for user: {}", id, email);
        Contact contact = contactRepository.findById(id)
                .filter(c -> c.getOwner().getEmail().equals(email))
                .orElseThrow(() -> new ResourceNotFoundException(CONTACT_NOT_FOUND + id));

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
            entry.setPhone(p.getPhone());
            entry.setLabel(p.getLabel());
            entry.setContact(contact);
            contact.getPhones().add(entry);
        });

        ContactResponse response = toResponse(contactRepository.save(contact));
        log.info("Contact updated with id: {}", id);
        return response;
    }

    public void deleteContact(String email, Long id) {
        log.info("Deleting contact id: {} for user: {}", id, email);
        Contact contact = contactRepository.findById(id)
                .filter(c -> c.getOwner().getEmail().equals(email))
                .orElseThrow(() -> new ResourceNotFoundException(CONTACT_NOT_FOUND + id));
        contactRepository.delete(contact);
        log.info("Contact deleted with id: {}", id);
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
    public String exportContacts(String email) {
        log.info("Exporting contacts for user: {}", email);
        List<Contact> contacts = contactRepository
                .findByOwnerEmail(email, PageRequest.of(0, 1000))
                .getContent();

        StringBuilder csv = new StringBuilder();
        csv.append("First Name,Last Name,Title,Emails,Phones\n");

        for (Contact contact : contacts) {
            String emails = contact.getEmails().stream()
                    .map(e -> e.getEmail() + "(" + e.getLabel() + ")")
                    .collect(Collectors.joining("|"));
            String phones = contact.getPhones().stream()
                    .map(p -> p.getPhone() + "(" + p.getLabel() + ")")
                    .collect(Collectors.joining("|"));

            csv.append(String.format("%s,%s,%s,%s,%s\n",
                    contact.getFirstName(),
                    contact.getLastName(),
                    contact.getTitle() != null ? contact.getTitle() : "",
                    emails,
                    phones));
        }
        return csv.toString();
    }

    public void importContacts(String email, MultipartFile file) throws Exception {
        log.info("Importing contacts for user: {}", email);
        user owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        String content = new String(file.getBytes());
        String[] lines = content.split("\n");

        for (int i = 1; i < lines.length; i++) {
            String[] fields = lines[i].split(",");
            if (fields.length < 2) continue;

            Contact contact = new Contact();
            contact.setFirstName(fields[0].trim());
            contact.setLastName(fields[1].trim());
            contact.setTitle(fields.length > 2 ? fields[2].trim() : "");
            contact.setOwner(owner);
            contact.setEmails(new ArrayList<>());
            contact.setPhones(new ArrayList<>());

            if (fields.length > 3 && !fields[3].trim().isEmpty()) {
                String[] emailParts = fields[3].split("\\|");
                for (String ep : emailParts) {
                    EmailEntry emailEntry = new EmailEntry();
                    if (ep.contains("(")) {
                        emailEntry.setEmail(ep.substring(0, ep.indexOf("(")));
                        emailEntry.setLabel(ep.substring(ep.indexOf("(") + 1, ep.indexOf(")")));
                    } else {
                        emailEntry.setEmail(ep.trim());
                        emailEntry.setLabel("work");
                    }
                    emailEntry.setContact(contact);
                    contact.getEmails().add(emailEntry);
                }
            }

            if (fields.length > 4 && !fields[4].trim().isEmpty()) {
                String[] phoneParts = fields[4].split("\\|");
                for (String pp : phoneParts) {
                    PhoneEntry phoneEntry = new PhoneEntry();
                    if (pp.contains("(")) {
                        phoneEntry.setPhone(pp.substring(0, pp.indexOf("(")));
                        phoneEntry.setLabel(pp.substring(pp.indexOf("(") + 1, pp.indexOf(")")));
                    } else {
                        phoneEntry.setPhone(pp.trim());
                        phoneEntry.setLabel("home");
                    }
                    phoneEntry.setContact(contact);
                    contact.getPhones().add(phoneEntry);
                }
            }
            contactRepository.save(contact);
        }
    }
}