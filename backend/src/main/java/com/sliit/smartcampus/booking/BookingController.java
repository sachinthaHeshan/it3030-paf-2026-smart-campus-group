package com.sliit.smartcampus.booking;

import com.sliit.smartcampus.booking.dto.BookingResponse;
import com.sliit.smartcampus.booking.dto.CreateBookingRequest;
import com.sliit.smartcampus.booking.dto.ResourceResponse;
import com.sliit.smartcampus.booking.dto.ReviewBookingRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/bookings/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id, Authentication auth) {
        try {
            BookingResponse booking = bookingService.getBookingById(id);
            Long userId = Long.parseLong(auth.getPrincipal().toString());
            String role = auth.getAuthorities().iterator().next().getAuthority();
            boolean isOwner = booking.userId().equals(userId);
            boolean isManagerOrAdmin = "ROLE_ADMIN".equals(role) || "ROLE_MANAGER".equals(role);

            if (!isOwner && !isManagerOrAdmin) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(
            @RequestBody CreateBookingRequest request, Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        try {
            BookingResponse booking = bookingService.createBooking(userId, request);
            return ResponseEntity.status(201).body(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/bookings/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> reviewBooking(
            @PathVariable Long id,
            @RequestBody ReviewBookingRequest request,
            Authentication auth) {
        Long reviewerId = Long.parseLong(auth.getPrincipal().toString());
        try {
            return ResponseEntity.ok(bookingService.reviewBooking(reviewerId, id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id, Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        try {
            return ResponseEntity.ok(bookingService.cancelBooking(userId, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/bookings/resources")
    public ResponseEntity<List<ResourceResponse>> getActiveResources() {
        return ResponseEntity.ok(bookingService.getActiveResources());
    }
}
