package com.svadbarium.venue.seo

import jakarta.servlet.http.HttpServletRequest

fun HttpServletRequest.baseUrl(): String {
    val isDefaultPort = (scheme == "http" && serverPort == 80) || (scheme == "https" && serverPort == 443)
    val portPart = if (isDefaultPort) "" else ":$serverPort"
    return "$scheme://$serverName$portPart"
}
