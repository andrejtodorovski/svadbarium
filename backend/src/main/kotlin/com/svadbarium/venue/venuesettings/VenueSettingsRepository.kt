package com.svadbarium.venue.venuesettings

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface VenueSettingsRepository : JpaRepository<VenueSettings, Long>
