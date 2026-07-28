package com.svadbarium.venue.common.file

import com.svadbarium.venue.common.exception.FileTooLargeException
import com.svadbarium.venue.common.exception.UnsupportedFileTypeException
import com.svadbarium.venue.config.FileUploadProperties
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Test
import org.springframework.web.multipart.MultipartFile
import kotlin.test.assertFailsWith

class FileValidationUtilTest {
    private val properties = FileUploadProperties(
        maxSizeBytes = 1000,
        allowedImageTypes = listOf("image/jpeg", "image/png"),
        allowedMenuTypes = listOf("image/jpeg", "image/png", "application/pdf"),
    )
    private val validator = FileValidationUtil(properties)

    private fun fileOf(contentType: String?, size: Long): MultipartFile = mockk {
        every { this@mockk.contentType } returns contentType
        every { this@mockk.size } returns size
    }

    @Test
    fun `accepts an allowed image type within the size limit`() {
        validator.validateImage(fileOf("image/jpeg", size = 500))
    }

    @Test
    fun `rejects a disallowed content type`() {
        assertFailsWith<UnsupportedFileTypeException> {
            validator.validateImage(fileOf("application/pdf", size = 500))
        }
    }

    @Test
    fun `rejects a null content type`() {
        assertFailsWith<UnsupportedFileTypeException> {
            validator.validateImage(fileOf(null, size = 500))
        }
    }

    @Test
    fun `rejects a file over the size limit even with an allowed type`() {
        assertFailsWith<FileTooLargeException> {
            validator.validateImage(fileOf("image/jpeg", size = 1001))
        }
    }

    @Test
    fun `menu validation allows PDFs that image validation would reject`() {
        validator.validateMenuFile(fileOf("application/pdf", size = 500))
        assertFailsWith<UnsupportedFileTypeException> {
            validator.validateImage(fileOf("application/pdf", size = 500))
        }
    }
}
