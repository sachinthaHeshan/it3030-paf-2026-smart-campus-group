package com.sliit.smartcampus.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ReviewBookingRequest(
        @NotBlank(message = "Status is required")
        @Pattern(regexp = "APPROVED|REJECTED",
                message = "Status must be APPROVED or REJECTED")
        String status,

        @Size(max = 500, message = "Review reason must be 500 characters or fewer")
        String reviewReason) {
}
