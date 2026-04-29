package com.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateAttachmentRequest(
        @NotBlank(message = "File name is required")
        @Size(max = 255, message = "File name must be 255 characters or fewer")
        String fileName,

        @NotBlank(message = "File path is required")
        @Size(max = 1024, message = "File path is too long")
        String filePath,

        @NotBlank(message = "File type is required")
        @Size(max = 100, message = "File type must be 100 characters or fewer")
        String fileType,

        @NotNull(message = "File size is required")
        @Positive(message = "File size must be positive")
        Long fileSize) {
}
