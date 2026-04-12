package com.sliit.smartcampus.booking;

import com.sliit.smartcampus.auth.User;
import com.sliit.smartcampus.auth.UserRepository;
import com.sliit.smartcampus.booking.dto.AvailabilityResponse;
import com.sliit.smartcampus.booking.dto.BookingResponse;
import com.sliit.smartcampus.booking.dto.CreateBookingRequest;
import com.sliit.smartcampus.booking.dto.ResourceResponse;
import com.sliit.smartcampus.booking.dto.ReviewBookingRequest;
import com.sliit.smartcampus.notification.NotificationService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class BookingService {

    private static final Set<String> REVIEW_STATUSES = Set.of("APPROVED", "REJECTED");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter ISO_FMT = DateTimeFormatter.ISO_INSTANT;

    private final BookingRepository bookingRepository;
    private final BookingResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          BookingResourceRepository resourceRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public BookingResponse createBooking(Long userId, CreateBookingRequest req) {
        Resource resource = resourceRepository.findById(req.resourceId())
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (!"ACTIVE".equals(resource.status())) {
            throw new IllegalStateException("Resource is not available for booking");
        }

        LocalDate bookingDate = LocalDate.parse(req.bookingDate());
        LocalTime startTime = LocalTime.parse(req.startTime());
        LocalTime endTime = LocalTime.parse(req.endTime());

        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        String dayOfWeek = bookingDate.getDayOfWeek()
                .getDisplayName(TextStyle.FULL, Locale.ENGLISH).toUpperCase();

        List<AvailabilityWindow> windows = resourceRepository
                .findAvailabilityWindows(req.resourceId(), dayOfWeek);

        if (!windows.isEmpty()) {
            boolean withinWindow = windows.stream().anyMatch(w ->
                    !startTime.isBefore(w.startTime()) && !endTime.isAfter(w.endTime()));
            if (!withinWindow) {
                throw new IllegalStateException(
                        "Requested time is outside the resource's availability window");
            }
        }

        List<Booking> conflicts = bookingRepository.findConflicting(
                req.resourceId(), bookingDate, startTime, endTime);
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException(
                    "Time slot conflicts with an existing booking");
        }

        Booking booking = bookingRepository.save(
                req.resourceId(), userId, bookingDate,
                startTime, endTime, req.purpose(), req.expectedAttendees());

        User user = userRepository.findById(userId).orElse(null);
        String userName = user != null ? user.name() : "A user";

        notificationService.notifyManagersAndAdmins(
                "NEW_BOOKING_REQUEST",
                "New Booking Request",
                userName + " requested to book " + resource.name(),
                "BOOKING",
                booking.id());

        return toResponse(booking);
    }

    public BookingResponse reviewBooking(Long reviewerId, Long bookingId, ReviewBookingRequest req) {
        if (!REVIEW_STATUSES.contains(req.status())) {
            throw new IllegalArgumentException("Status must be APPROVED or REJECTED");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!"PENDING".equals(booking.status())) {
            throw new IllegalStateException("Only PENDING bookings can be reviewed");
        }

        if ("REJECTED".equals(req.status()) &&
                (req.reviewReason() == null || req.reviewReason().isBlank())) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        bookingRepository.updateStatus(bookingId, req.status(), reviewerId, req.reviewReason());

        String notifType = "APPROVED".equals(req.status())
                ? "BOOKING_APPROVED" : "BOOKING_REJECTED";
        String title = "APPROVED".equals(req.status())
                ? "Booking Approved" : "Booking Rejected";

        Resource resource = resourceRepository.findById(booking.resourceId()).orElse(null);
        String resourceName = resource != null ? resource.name() : "a resource";

        String message = "Your booking for " + resourceName + " has been " +
                req.status().toLowerCase();

        notificationService.notify(
                booking.userId(), notifType, title, message, "BOOKING", bookingId);

        return getBookingById(bookingId);
    }

    public BookingResponse cancelBooking(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.userId().equals(userId)) {
            throw new IllegalStateException("Only the booking owner can cancel");
        }

        if (!"PENDING".equals(booking.status()) && !"APPROVED".equals(booking.status())) {
            throw new IllegalStateException("Only PENDING or APPROVED bookings can be cancelled");
        }

        bookingRepository.cancelBooking(bookingId);
        return getBookingById(bookingId);
    }

    public List<BookingResponse> getMyBookings(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<BookingResponse> getAllBookings(String status, Long resourceId,
                                               String dateFrom, String dateTo) {
        LocalDate from = dateFrom != null && !dateFrom.isBlank() ? LocalDate.parse(dateFrom) : null;
        LocalDate to = dateTo != null && !dateTo.isBlank() ? LocalDate.parse(dateTo) : null;
        return bookingRepository.findAll(status, resourceId, from, to).stream()
                .map(this::toResponse)
                .toList();
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return toResponse(booking);
    }

    public List<BookingResponse> getSchedule(Long resourceId, String date) {
        LocalDate localDate = LocalDate.parse(date);
        return bookingRepository.findByResourceAndDate(resourceId, localDate).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AvailabilityResponse> getAvailability(Long resourceId, String date) {
        LocalDate localDate = LocalDate.parse(date);
        String dayOfWeek = localDate.getDayOfWeek()
                .getDisplayName(TextStyle.FULL, Locale.ENGLISH).toUpperCase();
        return resourceRepository.findAvailabilityWindows(resourceId, dayOfWeek).stream()
                .map(w -> new AvailabilityResponse(
                        w.dayOfWeek(),
                        w.startTime().format(TIME_FMT),
                        w.endTime().format(TIME_FMT)))
                .toList();
    }

    public List<ResourceResponse> getActiveResources() {
        return resourceRepository.findAllActive().stream()
                .map(r -> new ResourceResponse(
                        r.id(), r.name(), r.type(), r.capacity(),
                        r.location(), r.description(), r.status()))
                .toList();
    }

    private BookingResponse toResponse(Booking b) {
        Resource resource = resourceRepository.findById(b.resourceId()).orElse(null);
        User user = userRepository.findById(b.userId()).orElse(null);
        User reviewer = b.reviewedBy() != null
                ? userRepository.findById(b.reviewedBy()).orElse(null) : null;

        return new BookingResponse(
                b.id(),
                b.resourceId(),
                resource != null ? resource.name() : null,
                resource != null ? resource.type() : null,
                resource != null ? resource.location() : null,
                b.userId(),
                user != null ? user.name() : null,
                user != null ? user.email() : null,
                b.bookingDate().format(DATE_FMT),
                b.startTime().format(TIME_FMT),
                b.endTime().format(TIME_FMT),
                b.purpose(),
                b.expectedAttendees(),
                b.status(),
                b.reviewedBy(),
                reviewer != null ? reviewer.name() : null,
                b.reviewReason(),
                b.reviewedAt() != null ? b.reviewedAt().atOffset(ZoneOffset.UTC).format(ISO_FMT) : null,
                b.createdAt().atOffset(ZoneOffset.UTC).format(ISO_FMT));
    }
}
