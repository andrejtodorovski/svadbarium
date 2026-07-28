package com.svadbarium.venue.seo

import io.mockk.every
import io.mockk.mockk
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Test
import kotlin.test.assertTrue

class SeoResourcesControllerTest {
    private val controller = SeoResourcesController()

    private fun requestFor(path: String) = mockk<HttpServletRequest> {
        every { scheme } returns "https"
        every { serverName } returns "grandhall.example"
        every { serverPort } returns 443
        every { requestURI } returns path
    }

    @Test
    fun `robots txt disallows the admin panel and points at this venue's own sitemap`() {
        val body = controller.robotsTxt(requestFor("/robots.txt")).body!!

        assertTrue(body.contains("Disallow: /admin/"))
        assertTrue(body.contains("Sitemap: https://grandhall.example/sitemap.xml"))
    }

    @Test
    fun `sitemap lists the three public routes on the venue's own domain`() {
        val body = controller.sitemapXml(requestFor("/sitemap.xml")).body!!

        assertTrue(body.contains("<loc>https://grandhall.example</loc>"))
        assertTrue(body.contains("<loc>https://grandhall.example/calendar</loc>"))
        assertTrue(body.contains("<loc>https://grandhall.example/menu</loc>"))
    }
}
