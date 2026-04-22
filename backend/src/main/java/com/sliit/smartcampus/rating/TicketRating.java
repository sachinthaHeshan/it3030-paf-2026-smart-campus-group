package com.sliit.smartcampus.rating;

import java.time.Instant;

public record TicketRating(
        Long id,
        Long ticketId,
        Long userId,
        Long technicianId,
        int stars,
        String comment,
        Instant createdAt) {
}
