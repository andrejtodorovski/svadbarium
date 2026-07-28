package com.svadbarium.venue.seo

import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

// robots.txt/sitemap.xml need the venue's real deployed domain (Railway/Render pick this per
// venue), which isn't known until request time — generated here instead of as static files.
@RestController
class SeoResourcesController {
    @GetMapping("/robots.txt", produces = [MediaType.TEXT_PLAIN_VALUE])
    fun robotsTxt(request: HttpServletRequest): ResponseEntity<String> {
        val baseUrl = request.baseUrl()
        val body = """
            User-agent: *
            Disallow: /admin/
            Sitemap: $baseUrl/sitemap.xml
        """.trimIndent()
        return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(body)
    }

    @GetMapping("/sitemap.xml", produces = [MediaType.APPLICATION_XML_VALUE])
    fun sitemapXml(request: HttpServletRequest): ResponseEntity<String> {
        val baseUrl = request.baseUrl()
        val urls = listOf("", "/calendar", "/menu")
            .joinToString("") { path -> "\n  <url><loc>$baseUrl$path</loc></url>" }
        val body = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">$urls
</urlset>"""
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(body)
    }
}
