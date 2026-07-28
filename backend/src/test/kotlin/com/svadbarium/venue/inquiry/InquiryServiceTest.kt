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
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class InquiryServiceTest {
    private val mailSender = mockk<JavaMailSender>(relaxed = true)
    private val venueSettingsRepository = mockk<VenueSettingsRepository>()
    private val inquiryRecordRepository = mockk<InquiryRecordRepository>(relaxed = true)

    init {
        // MockK's relaxed-mock default value generator can't satisfy JpaRepository's erased
        // generic save<S : T>(entity: S): S at runtime and throws a ClassCastException instead —
        // stub it explicitly so tests that don't care about the saved value don't have to.
        every { inquiryRecordRepository.save(any<InquiryRecord>()) } answers { firstArg() }
    }

    private fun service(fromAddress: String = "") =
        InquiryService(mailSender, venueSettingsRepository, inquiryRecordRepository, fromAddress)

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

    @Test
    fun `persists the enquiry even when the venue has no contact email configured`() {
        every { venueSettingsRepository.findById(1L) } returns Optional.of(venueSettings(contactEmail = null))
        val saved = slot<InquiryRecord>()
        every { inquiryRecordRepository.save(capture(saved)) } answers { saved.captured }

        assertFailsWith<IllegalStateException> { service().send(request) }

        assertEquals("Elena", saved.captured.name)
        assertEquals("Is the 12th available?", saved.captured.message)
    }

    @Test
    fun `persists the enquiry even when the email send itself throws`() {
        every { venueSettingsRepository.findById(1L) } returns Optional.of(venueSettings())
        val saved = slot<InquiryRecord>()
        every { inquiryRecordRepository.save(capture(saved)) } answers { saved.captured }
        every { mailSender.send(any<SimpleMailMessage>()) } throws RuntimeException("SMTP unreachable")

        assertFailsWith<RuntimeException> { service().send(request) }

        assertEquals("elena@example.com", saved.captured.email)
    }

    @Test
    fun `new records default to unhandled`() {
        every { venueSettingsRepository.findById(1L) } returns Optional.of(venueSettings())
        every { mailSender.send(any<SimpleMailMessage>()) } returns Unit
        val saved = slot<InquiryRecord>()
        every { inquiryRecordRepository.save(capture(saved)) } answers { saved.captured }

        service().send(request)

        assertFalse(saved.captured.handled)
    }

    @Test
    fun `list returns records ordered by most recent first`() {
        every { inquiryRecordRepository.findAllByOrderByCreatedAtDesc() } returns listOf(
            InquiryRecord(id = 2, name = "Sara", email = "sara@example.com", message = "Hi"),
            InquiryRecord(id = 1, name = "Elena", email = "elena@example.com", message = "Hi"),
        )

        val result = service().list()

        assertEquals(listOf(2L, 1L), result.map { it.id })
    }

    @Test
    fun `setHandled flips the handled flag and persists it`() {
        val record = InquiryRecord(id = 5, name = "Elena", email = "elena@example.com", message = "Hi", handled = false)
        every { inquiryRecordRepository.findById(5L) } returns Optional.of(record)
        every { inquiryRecordRepository.save(record) } returns record

        val result = service().setHandled(5, handled = true)

        assertTrue(result.handled)
        assertTrue(record.handled)
    }

    @Test
    fun `delete removes the record by id`() {
        every { inquiryRecordRepository.existsById(5L) } returns true

        service().delete(5)

        verify(exactly = 1) { inquiryRecordRepository.deleteById(5L) }
    }
}
