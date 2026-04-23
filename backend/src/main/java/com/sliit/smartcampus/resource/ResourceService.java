package com.sliit.smartcampus.resource;

import com.sliit.smartcampus.resource.dto.*;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

@Service
public class ResourceService {

    private static final DateTimeFormatter ISO_FMT = DateTimeFormatter.ISO_INSTANT;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    private static final Set<String> VALID_TYPES = Set.of(
            "LECTURE_HALL", "LAB", "MEETING_ROOM", "PROJECTOR", "CAMERA", "OTHER_EQUIPMENT");
    private static final Set<String> VALID_STATUSES = Set.of("ACTIVE", "OUT_OF_SERVICE");
    private static final Set<String> VALID_DAYS = Set.of(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY");

    private final ResourceRepository resourceRepository;
    private final AvailabilityWindowRepository availabilityWindowRepository;

    public ResourceService(ResourceRepository resourceRepository,
                           AvailabilityWindowRepository availabilityWindowRepository) {
        this.resourceRepository = resourceRepository;
        this.availabilityWindowRepository = availabilityWindowRepository;
    }

    public ResourceListResponse getResources(String type, String status, String search,
                                             String location, Integer minCapacity, Integer maxCapacity,
                                             int page, int size) {
        List<Resource> resources = resourceRepository.findAll(type, status, search, location, minCapacity, maxCapacity, page, size);
        long totalElements = resourceRepository.count(type, status, search, location, minCapacity, maxCapacity);
        int totalPages = (int) Math.ceil((double) totalElements / size);

        List<ResourceResponse> items = resources.stream()
                .map(r -> toResponse(r, availabilityWindowRepository.findByResourceId(r.id())))
                .toList();

        return new ResourceListResponse(items, page, totalPages, totalElements);
    }

    public ResourceResponse getResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        List<AvailabilityWindow> windows = availabilityWindowRepository.findByResourceId(id);
        return toResponse(resource, windows);
    }

    public HeatmapResponse getHeatmap(Long resourceId, int weeks) {
        resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        List<HeatmapCell> cells = resourceRepository.findHeatmap(resourceId, weeks);
        long maxCount = cells.stream().mapToLong(HeatmapCell::count).max().orElse(0L);
        return new HeatmapResponse(weeks, maxCount, cells);
    }

    public ResourceResponse createResource(Long userId, CreateResourceRequest request) {
        validateType(request.type());
        String status = request.status() != null ? request.status() : "ACTIVE";
        validateStatus(status);
        validateAvailabilityWindows(request.availabilityWindows());

        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (request.location() == null || request.location().isBlank()) {
            throw new IllegalArgumentException("Location is required");
        }

        Long resourceId = resourceRepository.save(
                request.name(), request.type(), request.capacity(),
                request.location(), request.description(), request.imageUrl(), status, userId);

        if (request.availabilityWindows() != null && !request.availabilityWindows().isEmpty()) {
            availabilityWindowRepository.saveAll(resourceId, request.availabilityWindows());
        }

        Resource saved = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve created resource"));
        List<AvailabilityWindow> windows = availabilityWindowRepository.findByResourceId(resourceId);
        return toResponse(saved, windows);
    }

    public ResourceResponse updateResource(Long id, UpdateResourceRequest request) {
        resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        validateType(request.type());
        validateAvailabilityWindows(request.availabilityWindows());

        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (request.location() == null || request.location().isBlank()) {
            throw new IllegalArgumentException("Location is required");
        }

        resourceRepository.update(id, request.name(), request.type(),
                request.capacity(), request.location(), request.description(), request.imageUrl());

        availabilityWindowRepository.deleteByResourceId(id);
        if (request.availabilityWindows() != null && !request.availabilityWindows().isEmpty()) {
            availabilityWindowRepository.saveAll(id, request.availabilityWindows());
        }

        Resource updated = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve updated resource"));
        List<AvailabilityWindow> windows = availabilityWindowRepository.findByResourceId(id);
        return toResponse(updated, windows);
    }

    public ResourceResponse updateStatus(Long id, UpdateStatusRequest request) {
        resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        validateStatus(request.status());

        resourceRepository.updateStatus(id, request.status());

        Resource updated = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve updated resource"));
        List<AvailabilityWindow> windows = availabilityWindowRepository.findByResourceId(id);
        return toResponse(updated, windows);
    }

    public void deleteResource(Long id) {
        resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        resourceRepository.deleteById(id);
    }

    private ResourceResponse toResponse(Resource r, List<AvailabilityWindow> windows) {
        String createdByName = resourceRepository.findCreatedByName(r.createdBy());
        List<AvailabilityWindowResponse> windowResponses = windows.stream()
                .map(w -> new AvailabilityWindowResponse(
                        w.id(),
                        w.dayOfWeek(),
                        w.startTime().format(TIME_FMT),
                        w.endTime().format(TIME_FMT)))
                .toList();

        return new ResourceResponse(
                r.id(),
                r.name(),
                r.type(),
                r.capacity(),
                r.location(),
                r.description(),
                r.imageUrl(),
                r.status(),
                r.createdBy(),
                createdByName,
                r.createdAt().atOffset(ZoneOffset.UTC).format(ISO_FMT),
                r.updatedAt().atOffset(ZoneOffset.UTC).format(ISO_FMT),
                windowResponses);
    }

    private void validateType(String type) {
        if (type == null || !VALID_TYPES.contains(type)) {
            throw new IllegalArgumentException("Invalid resource type: " + type
                    + ". Must be one of: " + VALID_TYPES);
        }
    }

    private void validateStatus(String status) {
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Invalid status: " + status
                    + ". Must be one of: " + VALID_STATUSES);
        }
    }

    private void validateAvailabilityWindows(List<AvailabilityWindowRequest> windows) {
        if (windows == null) return;
        for (AvailabilityWindowRequest w : windows) {
            if (w.dayOfWeek() == null || !VALID_DAYS.contains(w.dayOfWeek())) {
                throw new IllegalArgumentException("Invalid day of week: " + w.dayOfWeek());
            }
            if (w.startTime() == null || w.endTime() == null) {
                throw new IllegalArgumentException("Start time and end time are required");
            }
        }
    }
}
