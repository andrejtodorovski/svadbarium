package com.svadbarium.venue.common.ratelimit

import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Component
import java.time.Duration
import java.time.Instant
import java.util.Collections
import java.util.concurrent.ConcurrentHashMap

// Simple in-memory sliding-window limiter — fine for a single-instance-per-venue deployment;
// would need a shared store (e.g. Redis) if this app ever ran multiple instances behind a
// load balancer, since each instance would otherwise track its own separate counts.
@Component
class RateLimiter {
    private val requestLog = ConcurrentHashMap<String, MutableList<Instant>>()

    fun tryConsume(key: String, maxRequests: Int, window: Duration): Boolean {
        val now = Instant.now()
        val log = requestLog.computeIfAbsent(key) { Collections.synchronizedList(mutableListOf()) }
        synchronized(log) {
            log.removeIf { it.isBefore(now.minus(window)) }
            if (log.size >= maxRequests) {
                return false
            }
            log.add(now)
            return true
        }
    }
}

// Railway/Render (and most PaaS hosts) sit the app behind a reverse proxy, so the socket address
// is the proxy's, not the visitor's — X-Forwarded-For carries the real client IP in that case.
fun HttpServletRequest.clientIp(): String =
    getHeader("X-Forwarded-For")?.split(",")?.firstOrNull()?.trim()?.takeIf { it.isNotBlank() }
        ?: remoteAddr
