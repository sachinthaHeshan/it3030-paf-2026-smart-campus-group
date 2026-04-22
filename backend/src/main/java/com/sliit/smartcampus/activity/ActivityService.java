package com.sliit.smartcampus.activity;

import com.sliit.smartcampus.activity.dto.ActivityActor;
import com.sliit.smartcampus.activity.dto.ActivityLogEntry;
import com.sliit.smartcampus.activity.dto.ActivityPage;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Service
public class ActivityService {

    private static final Map<String, String> ACTION_VERBS = Map.ofEntries(
            Map.entry("BOOKING_CREATED", "requested booking for"),
            Map.entry("BOOKING_APPROVED", "approved booking for"),
            Map.entry("BOOKING_REJECTED", "rejected booking for"),
            Map.entry("BOOKING_CANCELLED", "cancelled booking for"),
            Map.entry("TICKET_CREATED", "reported ticket"),
            Map.entry("TICKET_RESOLVED", "resolved ticket"),
            Map.entry("TICKET_CLOSED", "closed ticket"),
            Map.entry("COMMENT_POSTED", "posted a"),
            Map.entry("COMMENT_EDITED", "edited a"),
            Map.entry("RESOURCE_CREATED", "added resource"),
            Map.entry("USER_JOINED", "joined the system"));

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public ActivityPage getActivities(Long actorId, String action, String targetType,
                                      String from, String to, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 200));

        OffsetDateTime fromDt = parseDate(from, true);
        OffsetDateTime toDt = parseDate(to, false);

        List<ActivityLogEntry> rows = activityRepository.findActivities(
                actorId, action, targetType, fromDt, toDt, safePage, safeSize);
        long total = activityRepository.countActivities(actorId, action, targetType, fromDt, toDt);

        List<ActivityLogEntry> enriched = rows.stream()
                .map(this::withSummary)
                .toList();

        return new ActivityPage(enriched, total, safePage, safeSize);
    }

    public List<ActivityActor> getActors() {
        return activityRepository.findDistinctActors();
    }

    private ActivityLogEntry withSummary(ActivityLogEntry e) {
        String verb = ACTION_VERBS.getOrDefault(e.action(), e.action().toLowerCase().replace('_', ' '));
        String summary = "USER_JOINED".equals(e.action())
                ? verb
                : verb + " " + (e.targetLabel() != null ? e.targetLabel() : "");
        return new ActivityLogEntry(
                e.action(), e.actorId(), e.actorName(), e.actorRole(),
                e.targetType(), e.targetId(), e.targetLabel(), summary.trim(), e.occurredAt());
    }

    private OffsetDateTime parseDate(String value, boolean startOfDay) {
        if (value == null || value.isBlank()) return null;
        try {
            LocalDate d = LocalDate.parse(value);
            return startOfDay
                    ? d.atStartOfDay().atOffset(ZoneOffset.UTC)
                    : d.atTime(23, 59, 59).atOffset(ZoneOffset.UTC);
        } catch (Exception e) {
            return null;
        }
    }
}
