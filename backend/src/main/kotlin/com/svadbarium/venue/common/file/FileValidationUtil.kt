package com.svadbarium.venue.common.file

import com.svadbarium.venue.common.exception.FileTooLargeException
import com.svadbarium.venue.common.exception.UnsupportedFileTypeException
import com.svadbarium.venue.config.FileUploadProperties
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile

@Component
class FileValidationUtil(
    private val properties: FileUploadProperties,
) {
    fun validate(file: MultipartFile, allowedTypes: List<String>) {
        val contentType = file.contentType
        if (contentType == null || contentType !in allowedTypes) {
            throw UnsupportedFileTypeException(
                "Unsupported file type '$contentType'. Allowed: ${allowedTypes.joinToString()}",
            )
        }
        if (file.size > properties.maxSizeBytes) {
            throw FileTooLargeException(
                "File size ${file.size} bytes exceeds the ${properties.maxSizeBytes} byte limit",
            )
        }
    }

    fun validateImage(file: MultipartFile) = validate(file, properties.allowedImageTypes)

    fun validateMenuFile(file: MultipartFile) = validate(file, properties.allowedMenuTypes)
}
