package com.svadbarium.venue.availability

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface AvailabilityOverrideRepository : JpaRepository<AvailabilityOverride, Long> {
    fun findAllByDateBetween(from: LocalDate, to: LocalDate): List<AvailabilityOverride>
    fun findByDate(date: LocalDate): AvailabilityOverride?
    fun deleteByDate(date: LocalDate)
}
