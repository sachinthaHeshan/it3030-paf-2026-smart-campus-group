package com.sliit.smartcampus.analytics.dto;

public record PeakResourceResponse(
        Long id,
        String name,
        String type,
        String location,
        String status,
        long bookingCount,
        double sharePercent) {
}
