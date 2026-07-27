package com.svadbarium.venue.venuesettings

import com.svadbarium.venue.venuesettings.dto.VenueSettingsDto
import com.svadbarium.venue.venuesettings.dto.VenueSettingsUpdateRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
class VenueSettingsService(
    private val repository: VenueSettingsRepository,
) {
    fun getSettings(): VenueSettingsDto = repository.findById(1L)
        .orElseThrow { IllegalStateException("venue_settings row with id=1 is missing") }
        .toDto()

    @Transactional
    fun updateSettings(request: VenueSettingsUpdateRequest): VenueSettingsDto {
        val settings = repository.findById(1L)
            .orElseThrow { IllegalStateException("venue_settings row with id=1 is missing") }
        settings.name = request.name
        settings.description = request.description
        settings.address = request.address
        settings.latitude = request.latitude
        settings.longitude = request.longitude
        settings.guestCapacityMin = request.guestCapacityMin
        settings.guestCapacityMax = request.guestCapacityMax
        settings.parkingInfo = request.parkingInfo
        settings.contactEmail = request.contactEmail
        settings.contactPhone = request.contactPhone
        settings.socialLinks = request.socialLinks
        settings.themePrimaryColor = request.themePrimaryColor
        settings.themeDarkColor = request.themeDarkColor
        settings.themeLightColor = request.themeLightColor
        settings.updatedAt = Instant.now()
        return repository.save(settings).toDto()
    }

    private fun VenueSettings.toDto() = VenueSettingsDto(
        id = id,
        name = name,
        description = description,
        address = address,
        latitude = latitude,
        longitude = longitude,
        guestCapacityMin = guestCapacityMin,
        guestCapacityMax = guestCapacityMax,
        parkingInfo = parkingInfo,
        contactEmail = contactEmail,
        contactPhone = contactPhone,
        socialLinks = socialLinks,
        themePrimaryColor = themePrimaryColor,
        themeDarkColor = themeDarkColor,
        themeLightColor = themeLightColor,
        updatedAt = updatedAt,
    )
}
