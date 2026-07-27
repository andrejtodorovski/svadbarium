package com.svadbarium.venue.availability

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.time.LocalDate

@Entity
@Table(name = "availability_override")
class AvailabilityOverride(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val date: LocalDate,

    @Enumerated(EnumType.STRING)
    var status: AvailabilityStatus = AvailabilityStatus.UNAVAILABLE,

    var note: String? = null,

    @Column(name = "updated_at")
    var updatedAt: Instant = Instant.now(),
)
