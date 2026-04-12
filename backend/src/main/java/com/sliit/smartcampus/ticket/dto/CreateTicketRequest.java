package com.sliit.smartcampus.ticket.dto;

public record CreateTicketRequest(
        String title,
        String description,
        String category,
        String priority,
        String location,
        Long resourceId,
        String contactEmail,
        String contactPhone) {
}
