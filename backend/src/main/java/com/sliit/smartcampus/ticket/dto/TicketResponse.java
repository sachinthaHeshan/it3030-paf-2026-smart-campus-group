package com.sliit.smartcampus.ticket.dto;

import com.sliit.smartcampus.rating.dto.RatingResponse;

import java.time.Instant;
import java.util.List;

public record TicketResponse(
        Long id,
        String code,
        String title,
        String description,
        String category,
        String priority,
        String status,
        String location,
        Long resourceId,
        String resourceName,
        String contactEmail,
        String contactPhone,
        Long createdById,
        String createdByName,
        String createdByAvatar,
        Long assignedToId,
        String assignedToName,
        String assignedToAvatar,
        String rejectionReason,
        String resolutionNotes,
        Instant resolvedAt,
        Instant closedAt,
        Instant createdAt,
        Instant updatedAt,
        List<TicketAttachmentResponse> attachments,
        RatingResponse rating,
        boolean canRate) {
}
