package com.svadbarium.venue.inquiry

import com.svadbarium.venue.inquiry.dto.InquiryRequest
import com.svadbarium.venue.venuesettings.VenueSettingsRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service

@Service
class InquiryService(
    private val mailSender: JavaMailSender,
    private val venueSettingsRepository: VenueSettingsRepository,
    // Many SMTP providers (SES, SendGrid, etc.) reject mail with no/mismatched From address.
    // Defaults to the venue's own contact address if no dedicated sender address is configured.
    // Not set right now
    @Value("\${app.mail.from-address:}") private val fromAddress: String,
) {
    fun send(request: InquiryRequest) {
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
}
