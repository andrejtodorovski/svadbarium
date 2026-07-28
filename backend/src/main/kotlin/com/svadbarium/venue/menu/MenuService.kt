package com.svadbarium.venue.menu

import com.svadbarium.venue.common.dto.FileContent
import com.svadbarium.venue.common.dto.ReorderItem
import com.svadbarium.venue.common.exception.NotFoundException
import com.svadbarium.venue.common.file.FileValidationUtil
import com.svadbarium.venue.common.file.ImageResizeUtil
import com.svadbarium.venue.menu.dto.MenuFileDto
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class MenuService(
    private val repository: MenuFileRepository,
    private val fileValidationUtil: FileValidationUtil,
    private val imageResizeUtil: ImageResizeUtil,
) {
    fun list(): List<MenuFileDto> = repository.findAllByOrderBySortOrderAsc().map { it.toDto() }

    fun getFile(id: Long): FileContent {
        val menuFile = repository.findById(id).orElseThrow { NotFoundException("Menu file $id not found") }
        return FileContent(menuFile.fileData, menuFile.contentType)
    }

    @Transactional
    fun upload(file: MultipartFile, title: String?): MenuFileDto {
        fileValidationUtil.validateMenuFile(file)
        val nextSortOrder = (repository.findAllByOrderBySortOrderAsc().maxOfOrNull { it.sortOrder } ?: -1) + 1
        val fileData = imageResizeUtil.resizeIfNeeded(file.bytes, file.contentType!!)
        val menuFile = MenuFile(
            fileData = fileData,
            contentType = file.contentType!!,
            fileSize = fileData.size,
            title = title,
            sortOrder = nextSortOrder,
        )
        return repository.save(menuFile).toDto()
    }

    @Transactional
    fun reorder(items: List<ReorderItem>) {
        val files = repository.findAllById(items.map { it.id }).associateBy { it.id }
        items.forEach { item ->
            files[item.id]?.sortOrder = item.sortOrder
        }
        repository.saveAll(files.values)
    }

    @Transactional
    fun delete(id: Long) {
        if (!repository.existsById(id)) {
            throw NotFoundException("Menu file $id not found")
        }
        repository.deleteById(id)
    }

    private fun MenuFile.toDto() = MenuFileDto(
        id = id,
        title = title,
        sortOrder = sortOrder,
        contentType = contentType,
    )
}
