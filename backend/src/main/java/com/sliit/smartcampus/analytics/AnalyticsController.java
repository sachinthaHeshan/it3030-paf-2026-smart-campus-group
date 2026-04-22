package com.sliit.smartcampus.analytics;

import com.sliit.smartcampus.analytics.dto.PeakResourceResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private static final int DEFAULT_DAYS = 30;
    private static final int DEFAULT_LIMIT = 5;
    private static final int MAX_DAYS = 365;
    private static final int MAX_LIMIT = 20;

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/peak-resources")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<PeakResourceResponse>> getPeakResources(
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) Integer limit) {
        int safeDays = clamp(days != null ? days : DEFAULT_DAYS, 1, MAX_DAYS);
        int safeLimit = clamp(limit != null ? limit : DEFAULT_LIMIT, 1, MAX_LIMIT);
        return ResponseEntity.ok(analyticsService.getPeakResources(safeDays, safeLimit));
    }

    private static int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
