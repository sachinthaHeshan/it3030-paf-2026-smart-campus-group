package com.sliit.smartcampus.rating;

import com.sliit.smartcampus.auth.User;
import com.sliit.smartcampus.auth.UserRepository;
import com.sliit.smartcampus.rating.dto.CreateRatingRequest;
import com.sliit.smartcampus.rating.dto.RatingResponse;
import com.sliit.smartcampus.rating.dto.TechnicianRatingSummary;
import com.sliit.smartcampus.ticket.Ticket;
import com.sliit.smartcampus.ticket.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

@Service
public class TicketRatingService {

    private static final DateTimeFormatter ISO_FMT = DateTimeFormatter.ISO_INSTANT;
    private static final Set<String> RATEABLE_STATUSES = Set.of("RESOLVED", "CLOSED");

    private final TicketRatingRepository ratingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketRatingService(TicketRatingRepository ratingRepository,
                               TicketRepository ticketRepository,
                               UserRepository userRepository) {
        this.ratingRepository = ratingRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public RatingResponse createRating(Long ticketId, Long callerId, CreateRatingRequest req) {
        if (req.stars() == null || req.stars() < 1 || req.stars() > 5) {
            throw new IllegalArgumentException("Stars must be between 1 and 5");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (!ticket.createdBy().equals(callerId)) {
            throw new IllegalStateException("Only the ticket reporter can rate this ticket");
        }

        if (!RATEABLE_STATUSES.contains(ticket.status())) {
            throw new IllegalStateException("Ticket must be RESOLVED or CLOSED before rating");
        }

        if (ratingRepository.findByTicketId(ticketId).isPresent()) {
            throw new IllegalStateException("This ticket has already been rated");
        }

        String trimmedComment = req.comment() != null ? req.comment().trim() : null;
        if (trimmedComment != null && trimmedComment.isEmpty()) {
            trimmedComment = null;
        }

        TicketRating saved = ratingRepository.save(
                ticketId, callerId, ticket.assignedTo(), req.stars(), trimmedComment);

        return toResponse(saved, callerId);
    }

    public RatingResponse getRating(Long ticketId) {
        return ratingRepository.findByTicketId(ticketId)
                .map(r -> toResponse(r, r.userId()))
                .orElse(null);
    }

    public List<TechnicianRatingSummary> getTechnicianAverages(int limit) {
        return ratingRepository.technicianAverages(Math.max(1, Math.min(limit, 50)));
    }

    public boolean canUserRate(Ticket ticket, Long callerId) {
        if (ticket == null || callerId == null) return false;
        if (!ticket.createdBy().equals(callerId)) return false;
        if (!RATEABLE_STATUSES.contains(ticket.status())) return false;
        return ratingRepository.findByTicketId(ticket.id()).isEmpty();
    }

    public RatingResponse loadResponse(Long ticketId) {
        return ratingRepository.findByTicketId(ticketId)
                .map(r -> toResponse(r, r.userId()))
                .orElse(null);
    }

    private RatingResponse toResponse(TicketRating r, Long ratedById) {
        User reporter = userRepository.findById(r.userId()).orElse(null);
        User technician = r.technicianId() != null
                ? userRepository.findById(r.technicianId()).orElse(null) : null;

        return new RatingResponse(
                r.stars(),
                r.comment(),
                r.userId(),
                reporter != null ? reporter.name() : null,
                r.createdAt().atOffset(ZoneOffset.UTC).format(ISO_FMT),
                r.technicianId(),
                technician != null ? technician.name() : null);
    }
}
