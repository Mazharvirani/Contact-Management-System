package com.example.contact_manager_backend;

import com.example.contact_manager_backend.entity.Contact;
import com.example.contact_manager_backend.entity.user;
import com.example.contact_manager_backend.repository.ContactRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.TestPropertySource;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@TestPropertySource(properties = {
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class ContactRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ContactRepository contactRepository;

    @Test
    void testFindByOwnerEmail() {
        user u = new user();
        u.setName("Mazhar");
        u.setEmail("mazhar@gmail.com");
        u.setPhone("03001234567");
        u.setPassword("encodedPassword");
        u.setRole("USER");
        entityManager.persist(u);

        Contact contact = new Contact();
        contact.setFirstName("John");
        contact.setLastName("Doe");
        contact.setTitle("Manager");
        contact.setOwner(u);
        contact.setEmails(new ArrayList<>());
        contact.setPhones(new ArrayList<>());
        entityManager.persist(contact);
        entityManager.flush();

        Page<Contact> result = contactRepository.findByOwnerEmail(
                "mazhar@gmail.com", PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        assertEquals("John", result.getContent().get(0).getFirstName());
    }

    @Test
    void testSearchByFirstName() {
        user u = new user();
        u.setName("Mazhar");
        u.setEmail("mazhar@gmail.com");
        u.setPhone("03001234567");
        u.setPassword("encodedPassword");
        u.setRole("USER");
        entityManager.persist(u);

        Contact contact = new Contact();
        contact.setFirstName("John");
        contact.setLastName("Doe");
        contact.setTitle("Manager");
        contact.setOwner(u);
        contact.setEmails(new ArrayList<>());
        contact.setPhones(new ArrayList<>());
        entityManager.persist(contact);
        entityManager.flush();

        Page<Contact> result = contactRepository
                .findByOwnerEmailAndFirstNameContainingIgnoreCaseOrOwnerEmailAndLastNameContainingIgnoreCase(
                        "mazhar@gmail.com", "john",
                        "mazhar@gmail.com", "john",
                        PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
    }
}