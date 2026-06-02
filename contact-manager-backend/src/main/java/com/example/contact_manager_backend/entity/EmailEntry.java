package com.example.contact_manager_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "email_entries")
@Getter
@Setter
public class EmailEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String label;

    @ManyToOne
    @JoinColumn(name = "contact_id")
    private Contact contact;
}