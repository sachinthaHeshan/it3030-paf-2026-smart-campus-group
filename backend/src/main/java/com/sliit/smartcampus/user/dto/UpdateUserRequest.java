package com.sliit.smartcampus.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
        String name,

        @Pattern(regexp = "USER|TECHNICIAN|MANAGER|ADMIN",
                message = "Role must be USER, TECHNICIAN, MANAGER or ADMIN")
        String role,

        Boolean active) {
}
