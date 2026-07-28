package com.svadbarium.venue.inquiry

import com.svadbarium.venue.common.exception.NotFoundException
import com.svadbarium.venue.inquiry.dto.InquiryRecordDto
import com.svadbarium.venue.inquiry.dto.InquiryRequest
import com.svadbarium.venue.venuesettings.VenueSettingsRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class InquiryService(
    private val mailSender: JavaMailSender,
    private val venueSettingsRepository: VenueSettingsRepository,
    private val inquiryRecordRepository: InquiryRecordRepository,
    // Many SMTP providers (SES, SendGrid, etc.) reject mail with no/mismatched From address.
    // Defaults to the venue's own contact address if no dedicated sender address is configured.
    // Not set right now
    @Value("\${app.mail.from-address:}") private val fromAddress: String,
) {
    // Persisted first, unconditionally — so the lead survives even if SMTP isn't configured, the
    // send fails, or the venue has no contact email set yet. Deliberately NOT @Transactional:
    // the save must commit on its own before the email attempt, so a later exception here (missing
    // contact email, SMTP failure) can't roll back the one part that's supposed to be guaranteed.
    fun send(request: InquiryRequest) {
        inquiryRecordRepository.save(
            InquiryRecord(
                name = request.name,
                email = request.email,
                phone = request.phone,
                eventDate = request.eventDate,
                message = request.message,
            ),
        )

        val settings = venueSettingsRepository.findById(1L)
            .orElseThrow { IllegalStateException("venue_settings row with id=1 is missing") }
        val recipient = settings.contactEmail
        if (recipient.isNullOrBlank()) {
            throw IllegalStateException("Venue has no contact email configured to receive enquiries")
        }

        val message = SimpleMailMessage()
        message.from = fromAddress.ifBlank { recipient }
        message.setTo(recipient)
        message.replyTo = request.email
        message.subject = "New enquiry from ${request.name}"
        message.text = buildBody(request)
        mailSender.send(message)
    }

    fun list(): List<InquiryRecordDto> = inquiryRecordRepository.findAllByOrderByCreatedAtDesc().map { it.toDto() }

    @Transactional
    fun setHandled(id: Long, handled: Boolean): InquiryRecordDto {
        val record = inquiryRecordRepository.findById(id).orElseThrow { NotFoundException("Inquiry $id not found") }
        record.handled = handled
        return inquiryRecordRepository.save(record).toDto()
    }

    @Transactional
    fun delete(id: Long) {
        if (!inquiryRecordRepository.existsById(id)) {
            throw NotFoundException("Inquiry $id not found")
        }
        inquiryRecordRepository.deleteById(id)
    }

    private fun buildBody(request: InquiryRequest): String = buildString {
        appendLine("New enquiry via the website")
        appendLine()
        appendLine("Name: ${request.name}")
        appendLine("Email: ${request.email}")
        request.phone?.let { appendLine("Phone: $it") }
        request.eventDate?.let { appendLine("Event date: $it") }
        appendLine()
        appendLine("Message:")
        appendLine(request.message)
    }

    private fun InquiryRecord.toDto() = InquiryRecordDto(
        id = id,
        name = name,
        email = email,
        phone = phone,
        eventDate = eventDate,
        message = message,
        handled = handled,
        createdAt = createdAt,
    )
}
