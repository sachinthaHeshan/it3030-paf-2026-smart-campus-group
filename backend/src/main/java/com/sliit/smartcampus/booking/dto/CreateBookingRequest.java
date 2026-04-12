package com.sliit.smartcampus.booking.dto;

public record CreateBookingRequest(
        Long resourceId,
        String bookingDate,
        String startTime,
        String endTime,
        String purpose,
        Integer expectedAttendees) {
}
