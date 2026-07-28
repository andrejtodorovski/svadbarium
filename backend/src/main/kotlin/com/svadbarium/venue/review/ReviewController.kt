package com.svadbarium.venue.review

import com.svadbarium.venue.review.dto.ReviewDto
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/reviews")
class ReviewController(
    private val service: ReviewService,
) {
    @GetMapping
    fun list(): List<ReviewDto> = service.list()
}
