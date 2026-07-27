package com.svadbarium.venue.menu

import com.svadbarium.venue.menu.dto.MenuFileDto
import org.springframework.http.CacheControl
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.TimeUnit

@RestController
@RequestMapping("/api/menus")
class MenuController(
    private val service: MenuService,
) {
    @GetMapping
    fun list(): List<MenuFileDto> = service.list()

    @GetMapping("/{id}/file")
    fun getFile(@PathVariable id: Long): ResponseEntity<ByteArray> {
        val file = service.getFile(id)
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(file.contentType))
            .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
            .body(file.bytes)
    }
}
