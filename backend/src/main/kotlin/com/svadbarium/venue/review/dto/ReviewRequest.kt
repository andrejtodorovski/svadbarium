package com.svadbarium.venue.review.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import java.time.LocalDate

data class ReviewRequest(
    @field:NotBlank
    val reviewerName: String,
    @field:NotBlank
    val reviewText: String,
    val reviewDate: LocalDate?,
    @field:Pattern(regexp = "^$|^https?://.+", message = "must be a full http(s) URL")
    val googleReviewUrl: String?,
)
