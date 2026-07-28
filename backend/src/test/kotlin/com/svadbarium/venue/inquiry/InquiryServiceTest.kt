package com.svadbarium.venue.inquiry

import com.svadbarium.venue.inquiry.dto.InquiryRequest
import com.svadbarium.venue.venuesettings.VenueSettings
import com.svadbarium.venue.venuesettings.VenueSettingsRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Test
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import java.time.LocalDate
import java.util.Optional
import kotlin.test.assertContains
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class InquiryServiceTest {
    private val mailSender = mockk<JavaMailSender>(relaxed = true)
    private val venueSettingsRepository = mockk<VenueSettingsRepository>()

    private fun service(fromAddress: String = "") = InquiryService(mailSender, venueSettingsRepository, fromAddress)

    private fun venueSettings(contactEmail: String? = "venue@example.com") = VenueSettings(
        id = 1L,
        name = "The Grand Hall",
        contactEmail = contactEmail,
    )

    private val request = InquiryRequest(
        name = "Elena",
        email = "elena@example.com",
        phone = "555-1234",
        eventDate = LocalDate.of(2026, 9, 12),
        message = "Is the 12th available?",
    )

    @Test
    fun `sends an email to the venue's contact address with the enquiry details`() {
        every { venueSettingsRepository.findById(1L) } returns Optional.of(venueSettings())
        val sent = slot<SimpleMailMessage>()
        every { mailSender.send(capture(sent)) } returns Unit

        service().send(request)

        assertEquals(listOf("venue@example.com"), sent.captured.to?.toList())
        assertEquals("elena@example.com", sent.captured.replyTo)
        assertEquals("New enquiry from Elena", sent.captured.subject)
        assertContains(sent.captured.text ?: "", "Is the 12th available?")
        assertContains(sent.captured.text ?: "", "555-1234")
    }

    @Test
    fun `falls back to the venue's own contact email as the From address when none is configured`() {
        every { venueSettingsRepository.findById(1L) } returns Optional.of(venueSettings())
        val sent = slot<SimpleMailMessage>()
        every { mailSender.send(capture(sent)) } returns Unit

        service(fromAddress = "").send(request)

        assertEquals("venue@example.com", sent.captured.from)
    }

    @Test
    fun `uses the configured From address over the venue's contact email when set`() {
        every { venueSettingsRepository.findById(1L) } returns Optional.of(venueSettings())
        val sent = slot<SimpleMailMessage>()
        every { mailSender.send(capture(sent)) } returns Unit

        service(fromAddress = "noreply@svadbarium.example").send(request)

        assertEquals("noreply@svadbarium.example", sent.captured.from)
    }

    @Test
    fun `throws instead of sending when the venue has no contact email configured`() {
        every { venueSettingsRepository.findById(1L) } returns Optional.of(venueSettings(contactEmail = null))

        assertFailsWith<IllegalStateException> { service().send(request) }
        verify(exactly = 0) { mailSender.send(any<SimpleMailMessage>()) }
    }

    @Test
    fun `throws instead of sending when the venue_settings row is missing`() {
        every { venueSettingsRepository.findById(1L) } returns Optional.empty()

        assertFailsWith<IllegalStateException> { service().send(request) }
        verify(exactly = 0) { mailSender.send(any<SimpleMailMessage>()) }
    }
}
