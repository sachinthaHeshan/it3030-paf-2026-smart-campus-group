package com.sliit.smartcampus.rating.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateRatingRequest(
        @NotNull
        @Min(1)
        @Max(5)
        Integer stars,
        String comment) {
}
