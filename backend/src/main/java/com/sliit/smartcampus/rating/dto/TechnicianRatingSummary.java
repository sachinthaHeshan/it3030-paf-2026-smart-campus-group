package com.sliit.smartcampus.rating.dto;

public record TechnicianRatingSummary(
        Long technicianId,
        String technicianName,
        double avgStars,
        long ratingCount) {
}
