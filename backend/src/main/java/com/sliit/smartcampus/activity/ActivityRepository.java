package com.sliit.smartcampus.activity;

import com.sliit.smartcampus.activity.dto.ActivityActor;
import com.sliit.smartcampus.activity.dto.ActivityLogEntry;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ActivityRepository {

    private static final DateTimeFormatter ISO_FMT = DateTimeFormatter.ISO_INSTANT;

    /**
     * UNION ALL of every derivable activity. Each subquery emits the same
     * column set so they can be combined into a single CTE. Subqueries are
     * grouped by event source so they are easy to extend.
     */
    private static final String ACTIVITIES_CTE = """
            WITH activities AS (
              -- Booking events
              SELECT 'BOOKING_CREATED'::text AS action, b.user_id AS actor_id,
                     'BOOKING'::text AS target_type, b.id AS target_id,
                     COALESCE(r.name, 'a resource') || ' on ' || b.booking_date::text AS target_label,
                     b.created_at AS occurred_at
              FROM bookings b LEFT JOIN resources r ON r.id = b.resource_id
              UNION ALL
              SELECT 'BOOKING_APPROVED', b.reviewed_by, 'BOOKING', b.id,
                     COALESCE(r.name, 'a resource') || ' on ' || b.booking_date::text, b.reviewed_at
              FROM bookings b LEFT JOIN resources r ON r.id = b.resource_id
              WHERE b.status = 'APPROVED' AND b.reviewed_at IS NOT NULL AND b.reviewed_by IS NOT NULL
              UNION ALL
              SELECT 'BOOKING_REJECTED', b.reviewed_by, 'BOOKING', b.id,
                     COALESCE(r.name, 'a resource') || ' on ' || b.booking_date::text, b.reviewed_at
              FROM bookings b LEFT JOIN resources r ON r.id = b.resource_id
              WHERE b.status = 'REJECTED' AND b.reviewed_at IS NOT NULL AND b.reviewed_by IS NOT NULL
              UNION ALL
              SELECT 'BOOKING_CANCELLED', b.user_id, 'BOOKING', b.id,
                     COALESCE(r.name, 'a resource') || ' on ' || b.booking_date::text, b.updated_at
              FROM bookings b LEFT JOIN resources r ON r.id = b.resource_id
              WHERE b.status = 'CANCELLED'

              -- Ticket events
              UNION ALL
              SELECT 'TICKET_CREATED', t.created_by, 'TICKET', t.id,
                     t.title, t.created_at
              FROM tickets t
              UNION ALL
              SELECT 'TICKET_RESOLVED', t.assigned_to, 'TICKET', t.id,
                     t.title, t.resolved_at
              FROM tickets t
              WHERE t.resolved_at IS NOT NULL AND t.assigned_to IS NOT NULL
              UNION ALL
              SELECT 'TICKET_CLOSED', t.assigned_to, 'TICKET', t.id,
                     t.title, t.closed_at
              FROM tickets t
              WHERE t.closed_at IS NOT NULL AND t.assigned_to IS NOT NULL

              -- Comment events
              UNION ALL
              SELECT 'COMMENT_POSTED', c.user_id, 'COMMENT', c.id,
                     'comment on "' || COALESCE(t.title, 'a ticket') || '"', c.created_at
              FROM ticket_comments c LEFT JOIN tickets t ON t.id = c.ticket_id
              UNION ALL
              SELECT 'COMMENT_EDITED', c.user_id, 'COMMENT', c.id,
                     'comment on "' || COALESCE(t.title, 'a ticket') || '"', c.updated_at
              FROM ticket_comments c LEFT JOIN tickets t ON t.id = c.ticket_id
              WHERE c.is_edited = TRUE

              -- Resource events
              UNION ALL
              SELECT 'RESOURCE_CREATED', r.created_by, 'RESOURCE', r.id,
                     r.name, r.created_at
              FROM resources r

              -- User events
              UNION ALL
              SELECT 'USER_JOINED', u.id, 'USER', u.id,
                     u.name, u.created_at
              FROM users u
            )
            """;

    private static final RowMapper<ActivityLogEntry> ROW_MAPPER = (rs, rowNum) -> {
        Timestamp ts = rs.getTimestamp("occurred_at");
        String iso = ts != null
                ? OffsetDateTime.ofInstant(ts.toInstant(), ZoneOffset.UTC).format(ISO_FMT)
                : null;
        Long targetId = rs.getObject("target_id") != null ? rs.getLong("target_id") : null;
        return new ActivityLogEntry(
                rs.getString("action"),
                rs.getLong("actor_id"),
                rs.getString("actor_name"),
                rs.getString("actor_role"),
                rs.getString("target_type"),
                targetId,
                rs.getString("target_label"),
                null,
                iso);
    };

    private final JdbcTemplate jdbcTemplate;

    public ActivityRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ActivityLogEntry> findActivities(Long actorId, String action, String targetType,
                                                 OffsetDateTime from, OffsetDateTime to,
                                                 int page, int size) {
        StringBuilder sql = new StringBuilder(ACTIVITIES_CTE);
        sql.append("""
                SELECT a.action, a.actor_id, a.target_type, a.target_id, a.target_label, a.occurred_at,
                       u.name AS actor_name, u.role AS actor_role
                FROM activities a
                JOIN users u ON u.id = a.actor_id
                WHERE 1=1
                """);

        List<Object> params = new ArrayList<>();
        appendFilters(sql, params, actorId, action, targetType, from, to);

        sql.append(" ORDER BY a.occurred_at DESC NULLS LAST LIMIT ? OFFSET ?");
        params.add(size);
        params.add((long) page * size);

        return jdbcTemplate.query(sql.toString(), ROW_MAPPER, params.toArray());
    }

    public long countActivities(Long actorId, String action, String targetType,
                                OffsetDateTime from, OffsetDateTime to) {
        StringBuilder sql = new StringBuilder(ACTIVITIES_CTE);
        sql.append("""
                SELECT COUNT(*)
                FROM activities a
                JOIN users u ON u.id = a.actor_id
                WHERE 1=1
                """);

        List<Object> params = new ArrayList<>();
        appendFilters(sql, params, actorId, action, targetType, from, to);

        Long count = jdbcTemplate.queryForObject(sql.toString(), Long.class, params.toArray());
        return count != null ? count : 0L;
    }

    public List<ActivityActor> findDistinctActors() {
        StringBuilder sql = new StringBuilder(ACTIVITIES_CTE);
        sql.append("""
                SELECT DISTINCT u.id, u.name, u.role
                FROM activities a
                JOIN users u ON u.id = a.actor_id
                ORDER BY u.name ASC
                """);
        return jdbcTemplate.query(sql.toString(), (rs, rowNum) ->
                new ActivityActor(rs.getLong("id"), rs.getString("name"), rs.getString("role")));
    }

    private void appendFilters(StringBuilder sql, List<Object> params,
                               Long actorId, String action, String targetType,
                               OffsetDateTime from, OffsetDateTime to) {
        if (actorId != null) {
            sql.append(" AND a.actor_id = ?");
            params.add(actorId);
        }
        if (action != null && !action.isBlank()) {
            sql.append(" AND a.action = ?");
            params.add(action);
        }
        if (targetType != null && !targetType.isBlank()) {
            sql.append(" AND a.target_type = ?");
            params.add(targetType);
        }
        if (from != null) {
            sql.append(" AND a.occurred_at >= ?");
            params.add(Timestamp.from(from.toInstant()));
        }
        if (to != null) {
            sql.append(" AND a.occurred_at <= ?");
            params.add(Timestamp.from(to.toInstant()));
        }
    }
}
