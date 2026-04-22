package com.sliit.smartcampus.analytics;

import com.sliit.smartcampus.analytics.AnalyticsRepository.PeakResourceRow;
import com.sliit.smartcampus.analytics.dto.PeakResourceResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    public AnalyticsService(AnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    public List<PeakResourceResponse> getPeakResources(int days, int limit) {
        LocalDate sinceDate = LocalDate.now().minusDays(days);
        List<PeakResourceRow> rows = analyticsRepository.findPeakResources(sinceDate, limit);

        long total = rows.stream().mapToLong(PeakResourceRow::bookingCount).sum();

        return rows.stream()
                .map(r -> new PeakResourceResponse(
                        r.id(),
                        r.name(),
                        r.type(),
                        r.location(),
                        r.status(),
                        r.bookingCount(),
                        total > 0 ? (r.bookingCount() * 100.0) / total : 0.0))
                .toList();
    }
}
