package com.svadbarium.venue.inquiry

import com.svadbarium.venue.common.exception.TooManyRequestsException
import com.svadbarium.venue.common.ratelimit.RateLimiter
import com.svadbarium.venue.common.ratelimit.clientIp
import com.svadbarium.venue.inquiry.dto.InquiryRequest
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Duration

private const val MAX_INQUIRIES = 3
private val INQUIRY_WINDOW: Duration = Duration.ofMinutes(10)

@RestController
@RequestMapping("/api/inquiries")
class InquiryController(
    private val inquiryService: InquiryService,
    private val rateLimiter: RateLimiter,
) {
    @PostMapping
    fun submit(@Valid @RequestBody request: InquiryRequest, httpRequest: HttpServletRequest): ResponseEntity<Void> {
        if (!rateLimiter.tryConsume("inquiry:${httpRequest.clientIp()}", MAX_INQUIRIES, INQUIRY_WINDOW)) {
            throw TooManyRequestsException("Too many enquiries submitted. Please try again later.")
        }
        inquiryService.send(request)
        return ResponseEntity.status(HttpStatus.CREATED).build()
    }
}
