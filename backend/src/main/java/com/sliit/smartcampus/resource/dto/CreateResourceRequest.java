package com.sliit.smartcampus.resource.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateResourceRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 1, max = 150, message = "Name must be between 1 and 150 characters")
        String name,

        @NotBlank(message = "Type is required")
        @Pattern(regexp = "LECTURE_HALL|LAB|MEETING_ROOM|PROJECTOR|CAMERA|OTHER_EQUIPMENT",
                message = "Type must be LECTURE_HALL, LAB, MEETING_ROOM, PROJECTOR, CAMERA or OTHER_EQUIPMENT")
        String type,

        @Positive(message = "Capacity must be positive")
        @Max(value = 10000, message = "Capacity must be 10000 or less")
        Integer capacity,

        @NotBlank(message = "Location is required")
        @Size(min = 1, max = 255, message = "Location must be between 1 and 255 characters")
        String location,

        @Size(max = 2000, message = "Description must be 2000 characters or fewer")
        String description,

        @Size(max = 1024, message = "Image URL is too long")
        String imageUrl,

        @Pattern(regexp = "ACTIVE|OUT_OF_SERVICE",
                message = "Status must be ACTIVE or OUT_OF_SERVICE")
        String status,

        @Valid
        List<AvailabilityWindowRequest> availabilityWindows) {
}
