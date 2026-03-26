package com.sliit.smartcampus.analytics;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Repository
public class AnalyticsRepository {

    private final JdbcTemplate jdbcTemplate;

    public AnalyticsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public record PeakResourceRow(
            Long id,
            String name,
            String type,
            String location,
            String status,
            long bookingCount) {
    }

    private static final RowMapper<PeakResourceRow> ROW_MAPPER = (rs, rowNum) -> new PeakResourceRow(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("type"),
            rs.getString("location"),
            rs.getString("status"),
            rs.getLong("booking_count"));

    public List<PeakResourceRow> findPeakResources(LocalDate sinceDate, int limit) {
        return jdbcTemplate.query(
                """
                SELECT r.id, r.name, r.type, r.location, r.status,
                       COUNT(b.id) AS booking_count
                FROM resources r
                LEFT JOIN bookings b
                  ON b.resource_id = r.id
                 AND b.status = 'APPROVED'
                 AND b.booking_date >= ?
                GROUP BY r.id, r.name, r.type, r.location, r.status
                ORDER BY booking_count DESC, r.name ASC
                LIMIT ?
                """,
                ROW_MAPPER,
                Date.valueOf(sinceDate),
                limit);
    }
}
