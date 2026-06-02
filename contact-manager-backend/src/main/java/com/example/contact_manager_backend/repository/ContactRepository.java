package com.example.contact_manager_backend.repository;

import com.example.contact_manager_backend.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends  JpaRepository<Contact, Long> {
    Page<Contact> findByOwnerEmail(String email,Pageable pageable);
    Page<Contact> findByOwnerEmailAndFirstNameContainingIgnoreCaseOrOwnerEmailAndLastNameContainingIgnoreCase(
            String email1, String firstName, String email2, String lastName, Pageable pageable
    );
    }

