package com.svadbarium.venue.venuesettings

import com.svadbarium.venue.venuesettings.dto.VenueSettingsDto
import com.svadbarium.venue.venuesettings.dto.VenueSettingsUpdateRequest
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/admin/venue-settings")
class VenueSettingsAdminController(
    private val service: VenueSettingsService,
) {
    @PutMapping
    fun updateSettings(@Valid @RequestBody request: VenueSettingsUpdateRequest): VenueSettingsDto =
        service.updateSettings(request)
}
