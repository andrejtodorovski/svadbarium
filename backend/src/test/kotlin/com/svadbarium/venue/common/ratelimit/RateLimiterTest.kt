package com.svadbarium.venue.common.ratelimit

import org.junit.jupiter.api.Test
import java.time.Duration
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class RateLimiterTest {
    private val limiter = RateLimiter()

    @Test
    fun `allows requests up to the limit then blocks`() {
        val key = "test-key-${System.nanoTime()}"

        repeat(3) {
            assertTrue(limiter.tryConsume(key, maxRequests = 3, window = Duration.ofMinutes(1)))
        }
        assertFalse(limiter.tryConsume(key, maxRequests = 3, window = Duration.ofMinutes(1)))
    }

    @Test
    fun `different keys are tracked independently`() {
        val keyA = "key-a-${System.nanoTime()}"
        val keyB = "key-b-${System.nanoTime()}"

        assertTrue(limiter.tryConsume(keyA, maxRequests = 1, window = Duration.ofMinutes(1)))
        assertFalse(limiter.tryConsume(keyA, maxRequests = 1, window = Duration.ofMinutes(1)))
        // keyB has never been touched, so it must not be affected by keyA's exhausted count.
        assertTrue(limiter.tryConsume(keyB, maxRequests = 1, window = Duration.ofMinutes(1)))
    }

    @Test
    fun `requests are allowed again once the window has fully elapsed`() {
        val key = "test-key-${System.nanoTime()}"
        val window = Duration.ofMillis(50)

        assertTrue(limiter.tryConsume(key, maxRequests = 1, window = window))
        assertFalse(limiter.tryConsume(key, maxRequests = 1, window = window))

        Thread.sleep(window.toMillis() + 20)

        assertTrue(limiter.tryConsume(key, maxRequests = 1, window = window))
    }
}
