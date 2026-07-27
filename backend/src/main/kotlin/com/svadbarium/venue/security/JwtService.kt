package com.svadbarium.venue.security

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Service
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(
    private val properties: JwtProperties,
) {
    private val key: SecretKey = Keys.hmacShaKeyFor(properties.secret.toByteArray())

    fun generateToken(username: String): String {
        val now = Date()
        val expiry = Date(now.time + properties.expirationMs)
        return Jwts.builder()
            .subject(username)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact()
    }

    fun validateAndGetUsername(token: String): String? = try {
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).payload.subject
    } catch (e: Exception) {
        null
    }
}
