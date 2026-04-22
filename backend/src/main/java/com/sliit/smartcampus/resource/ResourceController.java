package com.sliit.smartcampus.resource;

import com.sliit.smartcampus.resource.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<ResourceListResponse> getResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(resourceService.getResources(type, status, search, location, minCapacity, maxCapacity, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResource(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(resourceService.getResource(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/heatmap")
    public ResponseEntity<HeatmapResponse> getHeatmap(
            @PathVariable Long id,
            @RequestParam(defaultValue = "4") int weeks) {
        int safeWeeks = Math.max(1, Math.min(weeks, 52));
        try {
            return ResponseEntity.ok(resourceService.getHeatmap(id, safeWeeks));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ResourceResponse> createResource(
            Authentication authentication,
            @Valid @RequestBody CreateResourceRequest request) {
        Long userId = Long.parseLong(authentication.getName());
        try {
            ResourceResponse response = resourceService.createResource(userId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long id,
            @RequestBody UpdateResourceRequest request) {
        try {
            ResourceResponse response = resourceService.updateResource(id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ResourceResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        try {
            ResourceResponse response = resourceService.updateStatus(id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        try {
            resourceService.deleteResource(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
