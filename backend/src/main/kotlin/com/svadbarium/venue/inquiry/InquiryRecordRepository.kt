package com.svadbarium.venue.inquiry

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface InquiryRecordRepository : JpaRepository<InquiryRecord, Long> {
    fun findAllByOrderByCreatedAtDesc(): List<InquiryRecord>
}
