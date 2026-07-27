package com.svadbarium.venue.gallery

import com.svadbarium.venue.gallery.dto.GalleryImageDto
import org.springframework.http.CacheControl
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.TimeUnit

@RestController
@RequestMapping("/api/gallery")
class GalleryController(
    private val service: GalleryService,
) {
    @GetMapping
    fun list(): List<GalleryImageDto> = service.list()

    @GetMapping("/{id}/file")
    fun getFile(@PathVariable id: Long): ResponseEntity<ByteArray> {
        val file = service.getFile(id)
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(file.contentType))
            .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
            .body(file.bytes)
    }
}
