package com.sliit.smartcampus.rating;

import com.sliit.smartcampus.rating.dto.TechnicianRatingSummary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class TicketRatingRepository {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<TicketRating> ROW_MAPPER = (rs, rowNum) -> new TicketRating(
            rs.getLong("id"),
            rs.getLong("ticket_id"),
            rs.getLong("user_id"),
            rs.getObject("technician_id") != null ? rs.getLong("technician_id") : null,
            rs.getInt("stars"),
            rs.getString("comment"),
            rs.getTimestamp("created_at").toInstant());

    public TicketRatingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<TicketRating> findByTicketId(Long ticketId) {
        return jdbcTemplate.query(
                "SELECT * FROM ticket_ratings WHERE ticket_id = ?",
                ROW_MAPPER, ticketId).stream().findFirst();
    }

    public TicketRating save(Long ticketId, Long userId, Long technicianId,
                             int stars, String comment) {
        jdbcTemplate.update(
                """
                INSERT INTO ticket_ratings (ticket_id, user_id, technician_id, stars, comment)
                VALUES (?, ?, ?, ?, ?)
                """,
                ticketId, userId, technicianId, stars, comment);
        return findByTicketId(ticketId)
                .orElseThrow(() -> new IllegalStateException("Failed to load saved rating"));
    }

    public List<TechnicianRatingSummary> technicianAverages(int limit) {
        return jdbcTemplate.query(
                """
                SELECT u.id AS technician_id, u.name AS technician_name,
                       AVG(r.stars)::numeric(3,2) AS avg_stars,
                       COUNT(*) AS rating_count
                FROM ticket_ratings r
                JOIN users u ON u.id = r.technician_id
                WHERE r.technician_id IS NOT NULL
                GROUP BY u.id, u.name
                ORDER BY avg_stars DESC, rating_count DESC, u.name ASC
                LIMIT ?
                """,
                (rs, rowNum) -> new TechnicianRatingSummary(
                        rs.getLong("technician_id"),
                        rs.getString("technician_name"),
                        rs.getDouble("avg_stars"),
                        rs.getLong("rating_count")),
                limit);
    }
}
