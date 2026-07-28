package com.svadbarium.venue.inquiry

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.time.LocalDate

// Named "Record" (not "Inquiry") to avoid clashing with the existing InquiryRequest/InquiryService
// naming in this package, which predate persistence and are about the emailing flow specifically.
@Entity
@Table(name = "inquiry")
class InquiryRecord(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    var name: String = "",

    var email: String = "",

    var phone: String? = null,

    @Column(name = "event_date")
    var eventDate: LocalDate? = null,

    var message: String = "",

    var handled: Boolean = false,

    @Column(name = "created_at")
    var createdAt: Instant = Instant.now(),
)
