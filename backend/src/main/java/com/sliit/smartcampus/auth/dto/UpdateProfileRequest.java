package com.sliit.smartcampus.auth.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
        String name,

        @Size(max = 1024, message = "Profile picture URL is too long")
        String profilePicture) {
}
