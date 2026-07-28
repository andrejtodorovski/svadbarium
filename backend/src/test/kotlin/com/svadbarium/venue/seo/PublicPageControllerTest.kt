package com.svadbarium.venue.seo

import com.svadbarium.venue.gallery.GalleryService
import com.svadbarium.venue.gallery.dto.GalleryImageDto
import com.svadbarium.venue.venuesettings.VenueSettingsService
import com.svadbarium.venue.venuesettings.dto.VenueSettingsDto
import io.mockk.every
import io.mockk.mockk
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Test
import java.time.Instant
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class PublicPageControllerTest {
    private val venueSettingsService = mockk<VenueSettingsService>()
    private val galleryService = mockk<GalleryService>()
    private val controller = PublicPageController(venueSettingsService, galleryService)

    private fun settingsWith(
        name: String = "The Grand Hall",
        description: String? = "A lovely venue",
        address: String? = "123 Main St",
        contactPhone: String? = "555-1234",
        contactEmail: String? = "info@grandhall.test",
    ) = VenueSettingsDto(
        id = 1,
        name = name,
        description = description,
        address = address,
        latitude = null,
        longitude = null,
        guestCapacityMin = null,
        guestCapacityMax = null,
        parkingInfo = null,
        contactEmail = contactEmail,
        contactPhone = contactPhone,
        socialLinks = emptyMap(),
        themePrimaryColor = "#B8923F",
        themeDarkColor = "#14261F",
        themeLightColor = "#F7F2E7",
        googleReviewsUrl = null,
        mapEmbedUrl = null,
        updatedAt = Instant.now(),
    )

    private fun requestFor(path: String) = mockk<HttpServletRequest> {
        every { scheme } returns "http"
        every { serverName } returns "example.com"
        every { serverPort } returns 80
        every { requestURI } returns path
    }

    @Test
    fun `home page uses the bare venue name as the title`() {
        every { venueSettingsService.getSettings() } returns settingsWith(name = "The Grand Hall")
        every { galleryService.list() } returns emptyList()

        val body = controller.home(requestFor("/")).body!!

        assertTrue(body.contains("<title>The Grand Hall</title>"))
    }

    @Test
    fun `calendar and menu pages get a page-specific title prefix`() {
        every { venueSettingsService.getSettings() } returns settingsWith(name = "The Grand Hall")
        every { galleryService.list() } returns emptyList()

        assertTrue(controller.calendar(requestFor("/calendar")).body!!.contains("<title>Достапност | The Grand Hall</title>"))
        assertTrue(controller.menu(requestFor("/menu")).body!!.contains("<title>Мени | The Grand Hall</title>"))
    }

    @Test
    fun `falls back to a generated description when the venue hasn't set one`() {
        every { venueSettingsService.getSettings() } returns settingsWith(description = null, name = "The Grand Hall")
        every { galleryService.list() } returns emptyList()

        val body = controller.home(requestFor("/")).body!!

        assertTrue(body.contains("""content="Дознајте повеќе за The Grand Hall.""""))
    }

    @Test
    fun `HTML-escapes a venue name so it can't break out of the title or meta tags`() {
        every { venueSettingsService.getSettings() } returns settingsWith(name = "Grand </title><script>alert(1)</script>")
        every { galleryService.list() } returns emptyList()

        val body = controller.home(requestFor("/")).body!!

        assertFalse(body.contains("<script>alert(1)</script>"))
        assertTrue(body.contains("&lt;script&gt;"))
    }

    @Test
    fun `JSON-LD escapes quotes and angle brackets so the venue's own text can't break the script block`() {
        every { venueSettingsService.getSettings() } returns settingsWith(
            name = "The \"Grand\" Hall</script>",
        )
        every { galleryService.list() } returns emptyList()

        val body = controller.home(requestFor("/")).body!!
        val jsonLd = Regex("<script type=\"application/ld\\+json\">(.*?)</script>").find(body)!!.groupValues[1]

        assertTrue(jsonLd.contains("\\\"Grand\\\""))
        assertFalse(jsonLd.contains("</script>"))
        assertTrue(body.contains("\"@type\": \"LocalBusiness\""))
    }

    @Test
    fun `omits image tags entirely when the gallery is empty`() {
        every { venueSettingsService.getSettings() } returns settingsWith()
        every { galleryService.list() } returns emptyList()

        val body = controller.home(requestFor("/")).body!!

        assertFalse(body.contains("og:image"))
        assertFalse(body.contains("twitter:image"))
    }

    @Test
    fun `uses the first gallery image as the og and twitter image`() {
        every { venueSettingsService.getSettings() } returns settingsWith()
        every { galleryService.list() } returns listOf(
            GalleryImageDto(id = 5, caption = "Main Hall", sortOrder = 0, contentType = "image/jpeg"),
            GalleryImageDto(id = 6, caption = "Garden", sortOrder = 1, contentType = "image/jpeg"),
        )

        val body = controller.home(requestFor("/")).body!!

        assertTrue(body.contains("""<meta property="og:image" content="http://example.com/api/gallery/5/file">"""))
        assertTrue(body.contains("""<meta name="twitter:image" content="http://example.com/api/gallery/5/file">"""))
    }

    @Test
    fun `canonical URL and og-url reflect the actual request host and path`() {
        every { venueSettingsService.getSettings() } returns settingsWith()
        every { galleryService.list() } returns emptyList()

        val body = controller.calendar(requestFor("/calendar")).body!!

        assertTrue(body.contains("""<link rel="canonical" href="http://example.com/calendar">"""))
        assertTrue(body.contains("""<meta property="og:url" content="http://example.com/calendar">"""))
    }
}
