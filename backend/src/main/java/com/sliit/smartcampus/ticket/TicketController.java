package com.sliit.smartcampus.ticket;

import com.sliit.smartcampus.ticket.dto.*;
import com.sliit.smartcampus.user.UserService;
import com.sliit.smartcampus.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;

    public TicketController(TicketService ticketService, UserService userService) {
        this.ticketService = ticketService;
        this.userService = userService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketListResponse>> getMyTickets(Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        return ResponseEntity.ok(ticketService.getMyTickets(userId));
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<TicketListResponse>> getAssignedTickets(Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        return ResponseEntity.ok(ticketService.getAssignedTickets(userId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<TicketListResponse>> getAllTickets(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ticketService.getAllTickets(category, priority, status, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id, Authentication auth) {
        TicketResponse ticket = ticketService.getTicketById(id);
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        String role = auth.getAuthorities().iterator().next().getAuthority();
        boolean isOwner = ticket.createdById().equals(userId);
        boolean isAssignee = ticket.assignedToId() != null && ticket.assignedToId().equals(userId);
        boolean isManagerOrAdmin = "ROLE_ADMIN".equals(role) || "ROLE_MANAGER".equals(role);

        if (!isOwner && !isAssignee && !isManagerOrAdmin) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(ticket);
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request, Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        TicketResponse ticket = ticketService.createTicket(userId, request);
        return ResponseEntity.status(201).body(ticket);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequest request,
            Authentication auth) {
        Long actorId = Long.parseLong(auth.getPrincipal().toString());
        return ResponseEntity.ok(ticketService.updateTicket(id, request, actorId));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        TicketCommentResponse comment = ticketService.addComment(id, userId, request);
        return ResponseEntity.status(201).body(comment);
    }

    @PatchMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @RequestBody UpdateCommentRequest request,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        try {
            return ResponseEntity.ok(ticketService.updateComment(commentId, userId, request));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            Authentication auth) {
        Long userId = Long.parseLong(auth.getPrincipal().toString());
        String role = auth.getAuthorities().iterator().next().getAuthority()
                .replace("ROLE_", "");
        try {
            ticketService.deleteComment(commentId, userId, role);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<TicketAttachmentResponse> addAttachment(
            @PathVariable Long id,
            @Valid @RequestBody CreateAttachmentRequest request) {
        TicketAttachmentResponse attachment = ticketService.addAttachment(
                id, request.fileName(), request.filePath(), request.fileType(), request.fileSize());
        return ResponseEntity.status(201).body(attachment);
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<UserResponse>> getTechnicians() {
        return ResponseEntity.ok(userService.getTechnicians());
    }

    private static ResponseEntity<Map<String, Object>> forbidden(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "status", HttpStatus.FORBIDDEN.value(),
                "error", HttpStatus.FORBIDDEN.getReasonPhrase(),
                "message", message != null ? message : "Forbidden",
                "timestamp", Instant.now().toString()));
    }
}
