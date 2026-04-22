package com.sliit.smartcampus.activity.dto;

public record ActivityLogEntry(
        String action,
        Long actorId,
        String actorName,
        String actorRole,
        String targetType,
        Long targetId,
        String targetLabel,
        String summary,
        String occurredAt) {
}
