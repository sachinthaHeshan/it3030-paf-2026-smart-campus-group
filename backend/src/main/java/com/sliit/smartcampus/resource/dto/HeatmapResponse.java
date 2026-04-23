package com.sliit.smartcampus.resource.dto;

import java.util.List;

public record HeatmapResponse(int weeks, long maxCount, List<HeatmapCell> cells) {
}
