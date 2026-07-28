package com.svadbarium.venue.review

import com.svadbarium.venue.common.dto.ReorderItem
import com.svadbarium.venue.review.dto.ReviewDto
import com.svadbarium.venue.review.dto.ReviewRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/admin/reviews")
class ReviewAdminController(
    private val service: ReviewService,
) {
    @PostMapping
    fun create(@Valid @RequestBody request: ReviewRequest): ResponseEntity<ReviewDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.create(request))

    @PutMapping("/reorder")
    fun reorder(@RequestBody items: List<ReorderItem>): ResponseEntity<Void> {
        service.reorder(items)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: ReviewRequest): ReviewDto =
        service.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
