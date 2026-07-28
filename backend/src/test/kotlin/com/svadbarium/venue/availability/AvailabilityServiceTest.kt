package com.svadbarium.venue.availability

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Test
import java.time.LocalDate
import kotlin.test.assertEquals

class AvailabilityServiceTest {
    private val repository = mockk<AvailabilityOverrideRepository>(relaxed = true)
    private val service = AvailabilityService(repository)

    @Test
    fun `only unavailable dates are returned, available overrides are filtered out`() {
        val from = LocalDate.of(2026, 9, 1)
        val to = LocalDate.of(2026, 9, 30)
        every { repository.findAllByDateBetween(from, to) } returns listOf(
            AvailabilityOverride(date = LocalDate.of(2026, 9, 12), status = AvailabilityStatus.UNAVAILABLE),
            AvailabilityOverride(date = LocalDate.of(2026, 9, 15), status = AvailabilityStatus.AVAILABLE),
            AvailabilityOverride(date = LocalDate.of(2026, 9, 20), status = AvailabilityStatus.UNAVAILABLE),
        )

        val result = service.getUnavailableDates(from, to)

        assertEquals(listOf(LocalDate.of(2026, 9, 12), LocalDate.of(2026, 9, 20)), result.map { it.date })
    }

    @Test
    fun `marking a date unavailable creates a new override when none exists`() {
        val date = LocalDate.of(2026, 9, 12)
        every { repository.findByDate(date) } returns null
        val saved = slot<AvailabilityOverride>()
        every { repository.save(capture(saved)) } answers { saved.captured }

        service.setUnavailable(date, note = "Booked for a wedding")

        assertEquals(date, saved.captured.date)
        assertEquals(AvailabilityStatus.UNAVAILABLE, saved.captured.status)
        assertEquals("Booked for a wedding", saved.captured.note)
    }

    @Test
    fun `marking a date unavailable updates the existing override in place instead of duplicating it`() {
        val date = LocalDate.of(2026, 9, 12)
        val existing = AvailabilityOverride(id = 7, date = date, status = AvailabilityStatus.AVAILABLE, note = null)
        every { repository.findByDate(date) } returns existing
        val saved = slot<AvailabilityOverride>()
        every { repository.save(capture(saved)) } answers { saved.captured }

        service.setUnavailable(date, note = "Now booked")

        assertEquals(7, saved.captured.id)
        assertEquals(AvailabilityStatus.UNAVAILABLE, saved.captured.status)
        assertEquals("Now booked", saved.captured.note)
    }

    @Test
    fun `resetting a date deletes its override`() {
        val date = LocalDate.of(2026, 9, 12)

        service.reset(date)

        verify(exactly = 1) { repository.deleteByDate(date) }
    }
}
