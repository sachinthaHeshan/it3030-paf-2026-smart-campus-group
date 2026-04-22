package com.sliit.smartcampus.activity.dto;

import java.util.List;

public record ActivityPage(
        List<ActivityLogEntry> items,
        long total,
        int page,
        int size) {
}
