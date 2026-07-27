package com.svadbarium.venue.availability

import com.svadbarium.venue.availability.dto.UnavailableDateDto
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate

@Service
class AvailabilityService(
    private val repository: AvailabilityOverrideRepository,
) {
    fun getUnavailableDates(from: LocalDate, to: LocalDate): List<UnavailableDateDto> =
        repository.findAllByDateBetween(from, to)
            .filter { it.status == AvailabilityStatus.UNAVAILABLE }
            .map { UnavailableDateDto(it.date) }

    @Transactional
    fun setUnavailable(date: LocalDate, note: String?) {
        val existing = repository.findByDate(date)
        if (existing != null) {
            existing.status = AvailabilityStatus.UNAVAILABLE
            existing.note = note
            existing.updatedAt = Instant.now()
            repository.save(existing)
        } else {
            repository.save(AvailabilityOverride(date = date, status = AvailabilityStatus.UNAVAILABLE, note = note))
        }
    }

    @Transactional
    fun reset(date: LocalDate) {
        repository.deleteByDate(date)
    }
}
