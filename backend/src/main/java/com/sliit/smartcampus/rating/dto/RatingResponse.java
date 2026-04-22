package com.sliit.smartcampus.rating.dto;

public record RatingResponse(
        int stars,
        String comment,
        Long ratedById,
        String ratedByName,
        String ratedAt,
        Long technicianId,
        String technicianName) {
}
