package com.example.contact_manager_backend.repository;

import com.example.contact_manager_backend.entity.user;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<user, Long> {

    Optional<user> findByEmail(String email);
    Optional<user> findByPhone(String phone);
}