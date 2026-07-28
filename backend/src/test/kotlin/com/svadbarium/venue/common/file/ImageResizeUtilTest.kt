package com.svadbarium.venue.common.file

import org.junit.jupiter.api.Test
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ImageResizeUtilTest {
    private val util = ImageResizeUtil()

    private fun fakeImage(width: Int, height: Int, contentType: String): ByteArray {
        val type = if (contentType == "image/png") BufferedImage.TYPE_INT_ARGB else BufferedImage.TYPE_INT_RGB
        val image = BufferedImage(width, height, type)
        val output = ByteArrayOutputStream()
        ImageIO.write(image, if (contentType == "image/png") "png" else "jpg", output)
        return output.toByteArray()
    }

    @Test
    fun `passes non-image content types through untouched, like menu PDFs`() {
        val pdfBytes = "not really a pdf but not an image either".toByteArray()

        val result = util.resizeIfNeeded(pdfBytes, "application/pdf")

        assertTrue(result.contentEquals(pdfBytes))
    }

    @Test
    fun `leaves an image already within the size cap untouched`() {
        val small = fakeImage(800, 600, "image/jpeg")

        val result = util.resizeIfNeeded(small, "image/jpeg")

        assertTrue(result.contentEquals(small))
    }

    @Test
    fun `downscales a jpeg wider than the cap so its longest side fits`() {
        val big = fakeImage(4000, 3000, "image/jpeg")

        val result = util.resizeIfNeeded(big, "image/jpeg")
        val decoded = ImageIO.read(result.inputStream())!!

        assertEquals(2000, decoded.width)
        assertEquals(1500, decoded.height)
    }

    @Test
    fun `downscales a tall image using height as the constraining dimension`() {
        val tall = fakeImage(1000, 6000, "image/png")

        val result = util.resizeIfNeeded(tall, "image/png")
        val decoded = ImageIO.read(result.inputStream())!!

        assertEquals(2000, decoded.height)
        assertTrue(decoded.width < 1000)
    }

    @Test
    fun `resized output actually decodes back to a valid image of the expected format`() {
        val big = fakeImage(3000, 2000, "image/png")

        val result = util.resizeIfNeeded(big, "image/png")
        val decoded = ImageIO.read(result.inputStream())!!

        assertEquals(2000, decoded.width)
    }
}
