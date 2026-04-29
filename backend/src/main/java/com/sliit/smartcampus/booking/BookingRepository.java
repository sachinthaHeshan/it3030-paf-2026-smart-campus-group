package com.sliit.smartcampus.booking;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class BookingRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<Booking> ROW_MAPPER = (rs, rowNum) -> new Booking(
            rs.getLong("id"),
            rs.getLong("resource_id"),
            rs.getLong("user_id"),
            rs.getDate("booking_date").toLocalDate(),
            rs.getTime("start_time").toLocalTime(),
            rs.getTime("end_time").toLocalTime(),
            rs.getString("purpose"),
            rs.getObject("expected_attendees") != null ? rs.getInt("expected_attendees") : null,
            rs.getString("status"),
            rs.getObject("reviewed_by") != null ? rs.getLong("reviewed_by") : null,
            rs.getString("review_reason"),
            rs.getTimestamp("reviewed_at") != null ? rs.getTimestamp("reviewed_at").toInstant() : null,
            rs.getTimestamp("created_at").toInstant(),
            rs.getTimestamp("updated_at").toInstant());

    public BookingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<Booking> findById(Long id) {
        List<Booking> results = jdbcTemplate.query(
                "SELECT * FROM bookings WHERE id = ?",
                ROW_MAPPER, id);
        return results.stream().findFirst();
    }

    public List<Booking> findByUserId(Long userId) {
        return jdbcTemplate.query(
                "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC",
                ROW_MAPPER, userId);
    }

    public List<Booking> findAll(String status, Long resourceId, LocalDate dateFrom, LocalDate dateTo) {
        StringBuilder sql = new StringBuilder("SELECT * FROM bookings WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (status != null && !status.isBlank()) {
            sql.append(" AND status = ?");
            params.add(status);
        }
        if (resourceId != null) {
            sql.append(" AND resource_id = ?");
            params.add(resourceId);
        }
        if (dateFrom != null) {
            sql.append(" AND booking_date >= ?");
            params.add(Date.valueOf(dateFrom));
        }
        if (dateTo != null) {
            sql.append(" AND booking_date <= ?");
            params.add(Date.valueOf(dateTo));
        }

        sql.append(" ORDER BY created_at DESC");
        return jdbcTemplate.query(sql.toString(), ROW_MAPPER, params.toArray());
    }

    public Booking save(Long resourceId, Long userId, LocalDate bookingDate,
                        LocalTime startTime, LocalTime endTime,
                        String purpose, Integer expectedAttendees) {
        Timestamp now = Timestamp.from(Instant.now());
        jdbcTemplate.update(
                """
                INSERT INTO bookings (resource_id, user_id, booking_date, start_time, end_time,
                    purpose, expected_attendees, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
                """,
                resourceId, userId,
                Date.valueOf(bookingDate),
                Time.valueOf(startTime),
                Time.valueOf(endTime),
                purpose, expectedAttendees, now, now);

        List<Booking> results = jdbcTemplate.query(
                "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
                ROW_MAPPER, userId);
        return results.get(0);
    }

    public int updateStatus(Long id, String status, Long reviewedBy, String reviewReason) {
        Timestamp now = Timestamp.from(Instant.now());
        return jdbcTemplate.update(
                """
                UPDATE bookings
                SET status = ?, reviewed_by = ?, review_reason = ?, reviewed_at = ?, updated_at = ?
                WHERE id = ?
                """,
                status, reviewedBy, reviewReason, now, now, id);
    }

    public int cancelBooking(Long id) {
        Timestamp now = Timestamp.from(Instant.now());
        return jdbcTemplate.update(
                "UPDATE bookings SET status = 'CANCELLED', updated_at = ? WHERE id = ?",
                now, id);
    }

    public int deleteById(Long id) {
        return jdbcTemplate.update("DELETE FROM bookings WHERE id = ?", id);
    }

    public List<Booking> findByResourceAndDate(Long resourceId, LocalDate date) {
        return jdbcTemplate.query(
                """
                SELECT * FROM bookings
                WHERE resource_id = ?
                  AND booking_date = ?
                  AND status IN ('PENDING', 'APPROVED')
                ORDER BY start_time ASC
                """,
                ROW_MAPPER,
                resourceId,
                Date.valueOf(date));
    }

    public List<Booking> findConflicting(Long resourceId, LocalDate bookingDate,
                                         LocalTime startTime, LocalTime endTime) {
        return jdbcTemplate.query(
                """
                SELECT * FROM bookings
                WHERE resource_id = ?
                  AND booking_date = ?
                  AND status IN ('PENDING', 'APPROVED')
                  AND start_time < ?
                  AND end_time > ?
                """,
                ROW_MAPPER,
                resourceId,
                Date.valueOf(bookingDate),
                Time.valueOf(endTime),
                Time.valueOf(startTime));
    }
}
