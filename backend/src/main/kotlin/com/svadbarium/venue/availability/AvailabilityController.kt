package com.svadbarium.venue.availability

import com.svadbarium.venue.availability.dto.UnavailableDateDto
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/api/availability")
class AvailabilityController(
    private val service: AvailabilityService,
) {
    @GetMapping
    fun getUnavailableDates(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate,
    ): List<UnavailableDateDto> = service.getUnavailableDates(from, to)
}
