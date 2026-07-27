package com.svadbarium.venue.menu.dto

data class MenuFileDto(
    val id: Long,
    val title: String?,
    val sortOrder: Int,
    val contentType: String,
)
