package com.svadbarium.venue.review.dto

import java.time.LocalDate

data class ReviewDto(
    val id: Long,
    val reviewerName: String,
    val reviewText: String,
    val reviewDate: LocalDate?,
    val googleReviewUrl: String?,
    val sortOrder: Int,
)
