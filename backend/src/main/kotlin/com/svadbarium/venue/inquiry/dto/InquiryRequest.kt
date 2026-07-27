package com.svadbarium.venue.inquiry.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import java.time.LocalDate

data class InquiryRequest(
    @field:NotBlank val name: String,
    @field:NotBlank @field:Email val email: String,
    val phone: String?,
    val eventDate: LocalDate?,
    @field:NotBlank val message: String,
)
