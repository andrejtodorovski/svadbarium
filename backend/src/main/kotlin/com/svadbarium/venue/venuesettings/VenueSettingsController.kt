package com.svadbarium.venue.venuesettings

import com.svadbarium.venue.venuesettings.dto.VenueSettingsDto
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/venue-settings")
class VenueSettingsController(
    private val service: VenueSettingsService,
) {
    @GetMapping
    fun getSettings(): VenueSettingsDto = service.getSettings()
}
