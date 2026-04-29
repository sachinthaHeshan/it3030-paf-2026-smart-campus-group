package com.sliit.smartcampus.resource.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateStatusRequest(
        @NotBlank(message = "Status is required")
        @Pattern(regexp = "ACTIVE|OUT_OF_SERVICE",
                message = "Status must be ACTIVE or OUT_OF_SERVICE")
        String status) {
}
