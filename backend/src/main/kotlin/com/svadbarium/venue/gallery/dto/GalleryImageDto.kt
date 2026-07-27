package com.svadbarium.venue.gallery.dto

data class GalleryImageDto(
    val id: Long,
    val caption: String?,
    val sortOrder: Int,
    val contentType: String,
)
