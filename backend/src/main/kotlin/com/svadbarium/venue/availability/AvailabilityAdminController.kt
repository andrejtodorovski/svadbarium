package com.svadbarium.venue.availability

import com.svadbarium.venue.availability.dto.SetUnavailableRequest
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/api/admin/availability")
class AvailabilityAdminController(
    private val service: AvailabilityService,
) {
    @PostMapping("/{date}")
    fun setUnavailable(
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate,
        @RequestBody(required = false) request: SetUnavailableRequest?,
    ): ResponseEntity<Void> {
        service.setUnavailable(date, request?.note)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{date}")
    fun reset(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate): ResponseEntity<Void> {
        service.reset(date)
        return ResponseEntity.noContent().build()
    }
}
