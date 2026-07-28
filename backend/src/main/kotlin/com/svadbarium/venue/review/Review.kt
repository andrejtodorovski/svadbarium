package com.svadbarium.venue.review

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.time.LocalDate

@Entity
@Table(name = "review")
class Review(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "reviewer_name")
    var reviewerName: String = "",

    @Column(name = "review_text")
    var reviewText: String = "",

    @Column(name = "review_date")
    var reviewDate: LocalDate? = null,

    @Column(name = "google_review_url")
    var googleReviewUrl: String? = null,

    @Column(name = "sort_order")
    var sortOrder: Int = 0,

    @Column(name = "created_at")
    var createdAt: Instant = Instant.now(),
)
