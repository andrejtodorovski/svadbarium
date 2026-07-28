package com.svadbarium.venue.gallery

import com.svadbarium.venue.common.dto.ReorderItem
import com.svadbarium.venue.gallery.dto.CaptionUpdateRequest
import com.svadbarium.venue.gallery.dto.GalleryImageDto
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/admin/gallery")
class GalleryAdminController(
    private val service: GalleryService,
) {
    @PostMapping
    fun upload(
        @RequestPart("file") file: MultipartFile,
        @RequestParam(required = false) caption: String?,
    ): ResponseEntity<GalleryImageDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.upload(file, caption))

    @PutMapping("/reorder")
    fun reorder(@RequestBody items: List<ReorderItem>): ResponseEntity<Void> {
        service.reorder(items)
        return ResponseEntity.noContent().build()
    }

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: CaptionUpdateRequest): GalleryImageDto =
        service.updateCaption(id, request.caption)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
