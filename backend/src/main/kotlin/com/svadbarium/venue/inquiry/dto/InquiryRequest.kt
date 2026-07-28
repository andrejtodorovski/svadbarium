package com.svadbarium.venue.inquiry.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDate

data class InquiryRequest(
    @field:NotBlank @field:Size(max = 200) val name: String,
    @field:NotBlank @field:Email @field:Size(max = 200) val email: String,
    @field:Size(max = 50) val phone: String?,
    val eventDate: LocalDate?,
    @field:NotBlank @field:Size(max = 5000) val message: String,
)
