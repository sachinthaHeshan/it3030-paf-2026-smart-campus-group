package com.sliit.smartcampus.rating;

import com.sliit.smartcampus.rating.dto.CreateRatingRequest;
import com.sliit.smartcampus.rating.dto.RatingResponse;
import com.sliit.smartcampus.rating.dto.TechnicianRatingSummary;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TicketRatingController {

    private final TicketRatingService ratingService;

    public TicketRatingController(TicketRatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping("/tickets/{id}/rating")
    public ResponseEntity<?> submitRating(@PathVariable Long id,
                                          @Valid @RequestBody CreateRatingRequest req,
                                          Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        try {
            RatingResponse response = ratingService.createRating(id, userId, req);
            return ResponseEntity.status(201).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/tickets/{id}/rating")
    public ResponseEntity<?> getRating(@PathVariable Long id) {
        RatingResponse response = ratingService.getRating(id);
        if (response == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ratings/technicians")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<TechnicianRatingSummary>> getTechnicianAverages(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ratingService.getTechnicianAverages(limit));
    }
}
