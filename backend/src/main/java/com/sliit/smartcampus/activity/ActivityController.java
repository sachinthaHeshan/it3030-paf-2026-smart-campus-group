package com.sliit.smartcampus.activity;

import com.sliit.smartcampus.activity.dto.ActivityActor;
import com.sliit.smartcampus.activity.dto.ActivityPage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/activity-log")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<ActivityPage> getActivityLog(
            @RequestParam(required = false) Long actorId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(
                activityService.getActivities(actorId, action, targetType, from, to, page, size));
    }

    @GetMapping("/actors")
    public ResponseEntity<List<ActivityActor>> getActors() {
        return ResponseEntity.ok(activityService.getActors());
    }
}
