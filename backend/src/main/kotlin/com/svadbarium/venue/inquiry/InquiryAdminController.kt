package com.svadbarium.venue.inquiry

import com.svadbarium.venue.inquiry.dto.HandledUpdateRequest
import com.svadbarium.venue.inquiry.dto.InquiryRecordDto
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/admin/inquiries")
class InquiryAdminController(
    private val inquiryService: InquiryService,
) {
    @GetMapping
    fun list(): List<InquiryRecordDto> = inquiryService.list()

    @PutMapping("/{id}/handled")
    fun setHandled(@PathVariable id: Long, @RequestBody request: HandledUpdateRequest): InquiryRecordDto =
        inquiryService.setHandled(id, request.handled)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        inquiryService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
