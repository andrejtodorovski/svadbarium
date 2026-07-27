package com.svadbarium.venue.menu

import com.svadbarium.venue.common.dto.ReorderItem
import com.svadbarium.venue.menu.dto.MenuFileDto
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
@RequestMapping("/api/admin/menus")
class MenuAdminController(
    private val service: MenuService,
) {
    @PostMapping
    fun upload(
        @RequestPart("file") file: MultipartFile,
        @RequestParam(required = false) title: String?,
    ): ResponseEntity<MenuFileDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.upload(file, title))

    @PutMapping("/reorder")
    fun reorder(@RequestBody items: List<ReorderItem>): ResponseEntity<Void> {
        service.reorder(items)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
