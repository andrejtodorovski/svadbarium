package com.svadbarium.venue.common.file

import org.springframework.stereotype.Component
import java.awt.Image
import java.awt.RenderingHints
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.IIOImage
import javax.imageio.ImageIO
import javax.imageio.ImageWriteParam

private const val MAX_DIMENSION_PX = 2000
private const val JPEG_QUALITY = 0.85f

// Downscales/recompresses uploaded gallery and menu images so a phone's original (often 4000px+,
// several MB) doesn't get stored and served at full resolution on every page load forever after.
// Deliberately just a size cap, not a pipeline — no thumbnails/multiple derived sizes, no async
// processing queue. PDFs and images already within the cap pass through untouched.
@Component
class ImageResizeUtil {
    fun resizeIfNeeded(bytes: ByteArray, contentType: String): ByteArray {
        if (contentType != "image/jpeg" && contentType != "image/png") {
            return bytes
        }
        val original = ImageIO.read(bytes.inputStream()) ?: return bytes
        if (original.width <= MAX_DIMENSION_PX && original.height <= MAX_DIMENSION_PX) {
            return bytes
        }

        val scale = MAX_DIMENSION_PX.toDouble() / maxOf(original.width, original.height)
        val newWidth = (original.width * scale).toInt().coerceAtLeast(1)
        val newHeight = (original.height * scale).toInt().coerceAtLeast(1)

        val imageType = if (contentType == "image/png") BufferedImage.TYPE_INT_ARGB else BufferedImage.TYPE_INT_RGB
        val resized = BufferedImage(newWidth, newHeight, imageType)
        val graphics = resized.createGraphics()
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR)
        graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY)
        graphics.drawImage(original.getScaledInstance(newWidth, newHeight, Image.SCALE_SMOOTH), 0, 0, null)
        graphics.dispose()

        return encode(resized, contentType)
    }

    private fun encode(image: BufferedImage, contentType: String): ByteArray {
        val output = ByteArrayOutputStream()
        if (contentType == "image/png") {
            ImageIO.write(image, "png", output)
            return output.toByteArray()
        }

        val writer = ImageIO.getImageWritersByFormatName("jpg").next()
        val params = writer.defaultWriteParam.apply {
            compressionMode = ImageWriteParam.MODE_EXPLICIT
            compressionQuality = JPEG_QUALITY
        }
        ImageIO.createImageOutputStream(output).use { imageOutputStream ->
            writer.output = imageOutputStream
            writer.write(null, IIOImage(image, null, null), params)
        }
        writer.dispose()
        return output.toByteArray()
    }
}
