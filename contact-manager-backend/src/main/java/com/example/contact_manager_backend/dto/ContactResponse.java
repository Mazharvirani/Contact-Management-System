package com.example.contact_manager_backend.dto;
import java.util.List;

public class ContactResponse {
    public Long id;
    public String firstName;
    public String lastName;
    public String title;
    public List<EmailDto> emails;
    public List<PhoneDto> phones;

    public static class EmailDto {
        public String email;
        public String label;
    }

    public static class PhoneDto {
        public String phone;
        public String label;
    }
}
