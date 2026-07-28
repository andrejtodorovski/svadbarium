package com.svadbarium.venue.seo

import com.svadbarium.venue.gallery.GalleryService
import com.svadbarium.venue.venuesettings.VenueSettingsService
import com.svadbarium.venue.venuesettings.dto.VenueSettingsDto
import jakarta.servlet.http.HttpServletRequest
import org.springframework.core.io.ClassPathResource
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.util.HtmlUtils

// Crawlers and link-unfurlers (Facebook/Viber previews) read raw HTML meta tags — they don't run
// the Angular bundle. True SSR would need a live Node server per request, which doesn't fit this
// app's "redeploy the same image per venue" model well (see PublicPageControllerTest for why: the
// image is generic, so build-time prerendering would bake in no venue's real data). Injecting the
// real per-venue title/description/OG/Twitter/JSON-LD into the same index.html every request gets
// the actual payoff (correct previews, indexable name/description) without a new runtime.
@Controller
class PublicPageController(
    private val venueSettingsService: VenueSettingsService,
    private val galleryService: GalleryService,
) {
    private val indexHtmlTemplate: String by lazy {
        ClassPathResource("static/index.html").inputStream.bufferedReader().use { it.readText() }
    }

    @GetMapping("/", produces = [MediaType.TEXT_HTML_VALUE])
    fun home(request: HttpServletRequest): ResponseEntity<String> = renderPage(request, pageTitle = null)

    @GetMapping("/calendar", produces = [MediaType.TEXT_HTML_VALUE])
    fun calendar(request: HttpServletRequest): ResponseEntity<String> = renderPage(request, pageTitle = "Достапност")

    @GetMapping("/menu", produces = [MediaType.TEXT_HTML_VALUE])
    fun menu(request: HttpServletRequest): ResponseEntity<String> = renderPage(request, pageTitle = "Мени")

    private fun renderPage(request: HttpServletRequest, pageTitle: String?): ResponseEntity<String> {
        val settings = venueSettingsService.getSettings()
        val baseUrl = request.baseUrl()
        val canonicalUrl = baseUrl + request.requestURI
        val fullTitle = if (pageTitle != null) "$pageTitle | ${settings.name}" else settings.name
        val description = settings.description?.takeIf { it.isNotBlank() }
            ?: "Дознајте повеќе за ${settings.name}."
        val imageUrl = galleryService.list().firstOrNull()?.let { "$baseUrl/api/gallery/${it.id}/file" }

        val html = injectSeoTags(fullTitle, description, canonicalUrl, imageUrl, settings)
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html)
    }

    private fun injectSeoTags(
        title: String,
        description: String,
        canonicalUrl: String,
        imageUrl: String?,
        settings: VenueSettingsDto,
    ): String {
        val escapedTitle = HtmlUtils.htmlEscape(title)
        val escapedDescription = HtmlUtils.htmlEscape(description)
        val escapedCanonical = HtmlUtils.htmlEscape(canonicalUrl)
        val imageTags = imageUrl?.let {
            val escapedImage = HtmlUtils.htmlEscape(it)
            "\n            <meta property=\"og:image\" content=\"$escapedImage\">" +
                "\n            <meta name=\"twitter:image\" content=\"$escapedImage\">"
        } ?: ""

        val metaBlock = """
            <meta name="description" content="$escapedDescription">
            <link rel="canonical" href="$escapedCanonical">
            <meta property="og:type" content="website">
            <meta property="og:title" content="$escapedTitle">
            <meta property="og:description" content="$escapedDescription">
            <meta property="og:url" content="$escapedCanonical">$imageTags
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="$escapedTitle">
            <meta name="twitter:description" content="$escapedDescription">
            <script type="application/ld+json">${buildJsonLd(settings, canonicalUrl, imageUrl)}</script>
        """.trimIndent()

        return indexHtmlTemplate
            .replace(Regex("<title>.*?</title>", RegexOption.DOT_MATCHES_ALL), "<title>$escapedTitle</title>")
            .replace("</head>", "$metaBlock\n</head>")
    }

    private fun buildJsonLd(settings: VenueSettingsDto, url: String, imageUrl: String?): String {
        val fields = mutableListOf(
            "\"@context\": \"https://schema.org\"",
            "\"@type\": \"LocalBusiness\"",
            "\"name\": ${jsonString(settings.name)}",
            "\"url\": ${jsonString(url)}",
        )
        settings.description?.takeIf { it.isNotBlank() }?.let { fields += "\"description\": ${jsonString(it)}" }
        settings.address?.takeIf { it.isNotBlank() }?.let { fields += "\"address\": ${jsonString(it)}" }
        settings.contactPhone?.takeIf { it.isNotBlank() }?.let { fields += "\"telephone\": ${jsonString(it)}" }
        settings.contactEmail?.takeIf { it.isNotBlank() }?.let { fields += "\"email\": ${jsonString(it)}" }
        imageUrl?.let { fields += "\"image\": ${jsonString(it)}" }
        return "{" + fields.joinToString(",") + "}"
    }

    // Hand-rolled rather than pulling in an ObjectMapper for one flat object — the < escape on
    // "<" is defense in depth against a venue name/description containing "</script>" and breaking
    // out of the inline JSON-LD block.
    private fun jsonString(value: String): String {
        val escaped = value
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "")
            .replace("<", "\\u003c")
        return "\"$escaped\""
    }
}
