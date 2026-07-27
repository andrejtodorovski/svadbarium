package com.svadbarium.venue.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "file-upload")
data class FileUploadProperties(
    val maxSizeBytes: Long,
    val allowedImageTypes: List<String>,
    val allowedMenuTypes: List<String>,
)
