package com.svadbarium.venue.venuesettings.dto

import jakarta.validation.constraints.Pattern

private const val HEX_COLOR_PATTERN = "^#[0-9A-Fa-f]{6}$"

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
    @field:Pattern(regexp = HEX_COLOR_PATTERN, message = "must be a hex color like #B8923F")
    val themePrimaryColor: String,
    @field:Pattern(regexp = HEX_COLOR_PATTERN, message = "must be a hex color like #14261F")
    val themeDarkColor: String,
    @field:Pattern(regexp = HEX_COLOR_PATTERN, message = "must be a hex color like #F7F2E7")
    val themeLightColor: String,
    @field:Pattern(regexp = "^$|^https?://.+", message = "must be a full http(s) URL")
    val googleReviewsUrl: String?,
)
