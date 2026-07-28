package com.svadbarium.venue.security

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertNull

class JwtServiceTest {
    private val service = JwtService(JwtProperties(secret = "test-secret-at-least-32-bytes-long!!", expirationMs = 60_000))

    @Test
    fun `generated token round-trips back to the same username`() {
        val token = service.generateToken("admin")

        assertEquals("admin", service.validateAndGetUsername(token))
    }

    @Test
    fun `garbage token is rejected instead of throwing`() {
        assertNull(service.validateAndGetUsername("not-a-real-token"))
    }

    @Test
    fun `token signed with a different secret is rejected`() {
        val otherService = JwtService(JwtProperties(secret = "a-completely-different-secret-value!!", expirationMs = 60_000))
        val token = otherService.generateToken("admin")

        assertNull(service.validateAndGetUsername(token))
    }

    @Test
    fun `expired token is rejected`() {
        val expiredService = JwtService(JwtProperties(secret = "test-secret-at-least-32-bytes-long!!", expirationMs = -1_000))
        val token = expiredService.generateToken("admin")

        assertNull(service.validateAndGetUsername(token))
    }

    @Test
    fun `tokens for different usernames are not interchangeable`() {
        val adminToken = service.generateToken("admin")
        val otherToken = service.generateToken("someone-else")

        assertNotEquals(adminToken, otherToken)
        assertEquals("admin", service.validateAndGetUsername(adminToken))
        assertEquals("someone-else", service.validateAndGetUsername(otherToken))
    }
}
