package com.svadbarium.venue.inquiry.dto

import java.time.Instant
import java.time.LocalDate

data class InquiryRecordDto(
    val id: Long,
    val name: String,
    val email: String,
    val phone: String?,
    val eventDate: LocalDate?,
    val message: String,
    val handled: Boolean,
    val createdAt: Instant,
)
