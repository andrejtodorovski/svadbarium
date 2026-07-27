package com.svadbarium.venue.inquiry

import com.svadbarium.venue.inquiry.dto.InquiryRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/inquiries")
class InquiryController(
    private val inquiryService: InquiryService,
) {
    @PostMapping
    fun submit(@Valid @RequestBody request: InquiryRequest): ResponseEntity<Void> {
        inquiryService.send(request)
        return ResponseEntity.status(HttpStatus.CREATED).build()
    }
}
