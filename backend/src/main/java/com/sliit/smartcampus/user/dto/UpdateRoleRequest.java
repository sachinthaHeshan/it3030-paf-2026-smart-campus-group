package com.sliit.smartcampus.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateRoleRequest(
        @NotBlank(message = "Role is required")
        @Pattern(regexp = "USER|TECHNICIAN|MANAGER|ADMIN",
                message = "Role must be USER, TECHNICIAN, MANAGER or ADMIN")
        String role) {
}
