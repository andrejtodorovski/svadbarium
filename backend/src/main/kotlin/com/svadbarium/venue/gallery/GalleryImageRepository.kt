package com.svadbarium.venue.gallery

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface GalleryImageRepository : JpaRepository<GalleryImage, Long> {
    fun findAllByOrderBySortOrderAsc(): List<GalleryImage>
}
