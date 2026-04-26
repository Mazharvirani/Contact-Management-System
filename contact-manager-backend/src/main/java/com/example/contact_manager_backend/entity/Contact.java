package com.example.contact_manager_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name= "contacts")
@Getter
@Setter
public class Contact{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String FirstName;
    private String LastName;
    private String Title;

    @OneToMany(mappedBy = "contact",cascade= CascadeType.ALL, orphanRemoval = true)
    private List<PhoneEntry> phones;

    @OneToMany(mappedBy = "contact",cascade= CascadeType.ALL, orphanRemoval = true)
    private List<EmailEntry> emails;

    @ManyToOne
    @JoinColumn(name = "User_id")
    private user owner;
}