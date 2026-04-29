package com.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(
        @NotBlank(message = "Comment cannot be empty")
        @Size(max = 2000, message = "Comment must be 2000 characters or fewer")
        String content) {
}
