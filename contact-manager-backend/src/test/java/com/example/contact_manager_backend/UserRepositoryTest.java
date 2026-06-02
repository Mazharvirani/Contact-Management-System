package com.example.contact_manager_backend;

import com.example.contact_manager_backend.entity.user;
import com.example.contact_manager_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@TestPropertySource(properties = {
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testFindByEmail() {
        user u = new user();
        u.setName("Mazhar");
        u.setEmail("mazhar@gmail.com");
        u.setPhone("03001234567");
        u.setPassword("encodedPassword");
        u.setRole("USER");
        entityManager.persist(u);
        entityManager.flush();

        Optional<user> found = userRepository.findByEmail("mazhar@gmail.com");

        assertTrue(found.isPresent());
        assertEquals("mazhar@gmail.com", found.get().getEmail());
    }

    @Test
    void testFindByPhone() {
        user u = new user();
        u.setName("Mazhar");
        u.setEmail("mazhar2@gmail.com");
        u.setPhone("03001234568");
        u.setPassword("encodedPassword");
        u.setRole("USER");
        entityManager.persist(u);
        entityManager.flush();

        Optional<user> found = userRepository.findByPhone("03001234568");

        assertTrue(found.isPresent());
        assertEquals("03001234568", found.get().getPhone());
    }

    @Test
    void testFindByEmailNotFound() {
        Optional<user> found = userRepository.findByEmail("notfound@gmail.com");
        assertFalse(found.isPresent());
    }
}