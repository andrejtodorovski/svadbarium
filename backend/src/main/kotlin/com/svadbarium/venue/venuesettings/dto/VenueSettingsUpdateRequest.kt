package com.svadbarium.venue.venuesettings.dto

data class VenueSettingsUpdateRequest(
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
)
