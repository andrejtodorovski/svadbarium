package com.svadbarium.venue.venuesettings

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant

@Entity
@Table(name = "venue_settings")
class VenueSettings(
    @Id
    val id: Long = 1L,

    var name: String = "",

    var description: String? = null,

    var address: String? = null,

    var latitude: Double? = null,

    var longitude: Double? = null,

    @Column(name = "guest_capacity_min")
    var guestCapacityMin: Int? = null,

    @Column(name = "guest_capacity_max")
    var guestCapacityMax: Int? = null,

    @Column(name = "parking_info")
    var parkingInfo: String? = null,

    @Column(name = "contact_email")
    var contactEmail: String? = null,

    @Column(name = "contact_phone")
    var contactPhone: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "social_links", columnDefinition = "jsonb")
    var socialLinks: Map<String, String> = emptyMap(),

    @Column(name = "theme_primary_color")
    var themePrimaryColor: String = "#B8923F",

    @Column(name = "theme_dark_color")
    var themeDarkColor: String = "#14261F",

    @Column(name = "theme_light_color")
    var themeLightColor: String = "#F7F2E7",

    @Column(name = "updated_at")
    var updatedAt: Instant = Instant.now(),
)
