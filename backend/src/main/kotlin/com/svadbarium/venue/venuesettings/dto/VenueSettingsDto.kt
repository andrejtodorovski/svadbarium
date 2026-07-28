package com.svadbarium.venue.venuesettings.dto

import java.time.Instant

data class VenueSettingsDto(
    val id: Long,
    val name: String,
    val description: String?,
    val address: String?,
    val latitude: Double?,
    val longitude: Double?,
    val guestCapacityMin: Int?,
    val guestCapacityMax: Int?,
    val parkingInfo: String?,
    val contactEmail: String?,
    val contactPhone: String?,
    val socialLinks: Map<String, String>,
    val themePrimaryColor: String,
    val themeDarkColor: String,
    val themeLightColor: String,
    val googleReviewsUrl: String?,
    val updatedAt: Instant,
)
