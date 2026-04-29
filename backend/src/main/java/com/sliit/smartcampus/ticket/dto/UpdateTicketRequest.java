package com.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateTicketRequest(
        Long assignedTo,

        @Pattern(regexp = "OPEN|IN_PROGRESS|RESOLVED|REJECTED|CLOSED",
                message = "Status must be OPEN, IN_PROGRESS, RESOLVED, REJECTED or CLOSED")
        String status,

        @Size(max = 2000, message = "Resolution notes must be 2000 characters or fewer")
        String resolutionNotes,

        @Size(max = 1000, message = "Rejection reason must be 1000 characters or fewer")
        String rejectionReason) {
}
