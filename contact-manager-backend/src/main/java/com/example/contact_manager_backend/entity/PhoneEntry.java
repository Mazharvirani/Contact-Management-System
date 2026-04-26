package com.example.contact_manager_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "phone_entries")
@Getter
@Setter
public class PhoneEntry{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phone;
    private String label;

    @ManyToOne
    @JoinColumn(name = "contact_id")
    private Contact contact;

}