package com.svadbarium.venue.gallery

import com.svadbarium.venue.common.dto.FileContent
import com.svadbarium.venue.common.dto.ReorderItem
import com.svadbarium.venue.common.exception.NotFoundException
import com.svadbarium.venue.common.file.FileValidationUtil
import com.svadbarium.venue.gallery.dto.GalleryImageDto
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class GalleryService(
    private val repository: GalleryImageRepository,
    private val fileValidationUtil: FileValidationUtil,
) {
    fun list(): List<GalleryImageDto> = repository.findAllByOrderBySortOrderAsc().map { it.toDto() }

    fun getFile(id: Long): FileContent {
        val image = repository.findById(id).orElseThrow { NotFoundException("Gallery image $id not found") }
        return FileContent(image.fileData, image.contentType)
    }

    @Transactional
    fun upload(file: MultipartFile, caption: String?): GalleryImageDto {
        fileValidationUtil.validateImage(file)
        val nextSortOrder = (repository.findAllByOrderBySortOrderAsc().maxOfOrNull { it.sortOrder } ?: -1) + 1
        val image = GalleryImage(
            fileData = file.bytes,
            contentType = file.contentType!!,
            fileSize = file.size.toInt(),
            caption = caption,
            sortOrder = nextSortOrder,
        )
        return repository.save(image).toDto()
    }

    @Transactional
    fun reorder(items: List<ReorderItem>) {
        val images = repository.findAllById(items.map { it.id }).associateBy { it.id }
        items.forEach { item ->
            images[item.id]?.sortOrder = item.sortOrder
        }
        repository.saveAll(images.values)
    }

    @Transactional
    fun delete(id: Long) {
        if (!repository.existsById(id)) {
            throw NotFoundException("Gallery image $id not found")
        }
        repository.deleteById(id)
    }

    private fun GalleryImage.toDto() = GalleryImageDto(
        id = id,
        caption = caption,
        sortOrder = sortOrder,
        contentType = contentType,
    )
}
