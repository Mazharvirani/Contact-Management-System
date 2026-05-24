package com.example.contact_manager_backend.dto;

import java.util.List;

public class ContactRequest {
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
        private String phone;
        private String label;

        public String getPhone() {
            return phone;
        }
        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getLabel() {
            return label;
        }
        public void setLabel(String label) {
            this.label = label;
        }
    }
}