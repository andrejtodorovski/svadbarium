package com.svadbarium.venue.review

import com.svadbarium.venue.common.dto.ReorderItem
import com.svadbarium.venue.common.exception.NotFoundException
import com.svadbarium.venue.review.dto.ReviewDto
import com.svadbarium.venue.review.dto.ReviewRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ReviewService(
    private val repository: ReviewRepository,
) {
    fun list(): List<ReviewDto> = repository.findAllByOrderBySortOrderAsc().map { it.toDto() }

    @Transactional
    fun create(request: ReviewRequest): ReviewDto {
        val nextSortOrder = (repository.findAllByOrderBySortOrderAsc().maxOfOrNull { it.sortOrder } ?: -1) + 1
        val review = Review(
            reviewerName = request.reviewerName,
            reviewText = request.reviewText,
            reviewDate = request.reviewDate,
            googleReviewUrl = request.googleReviewUrl,
            sortOrder = nextSortOrder,
        )
        return repository.save(review).toDto()
    }

    @Transactional
    fun update(id: Long, request: ReviewRequest): ReviewDto {
        val review = repository.findById(id).orElseThrow { NotFoundException("Review $id not found") }
        review.reviewerName = request.reviewerName
        review.reviewText = request.reviewText
        review.reviewDate = request.reviewDate
        review.googleReviewUrl = request.googleReviewUrl
        return repository.save(review).toDto()
    }

    @Transactional
    fun reorder(items: List<ReorderItem>) {
        val reviews = repository.findAllById(items.map { it.id }).associateBy { it.id }
        items.forEach { item ->
            reviews[item.id]?.sortOrder = item.sortOrder
        }
        repository.saveAll(reviews.values)
    }

    @Transactional
    fun delete(id: Long) {
        if (!repository.existsById(id)) {
            throw NotFoundException("Review $id not found")
        }
        repository.deleteById(id)
    }

    private fun Review.toDto() = ReviewDto(
        id = id,
        reviewerName = reviewerName,
        reviewText = reviewText,
        reviewDate = reviewDate,
        googleReviewUrl = googleReviewUrl,
        sortOrder = sortOrder,
    )
}
