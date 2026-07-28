package com.svadbarium.venue.admin

import com.svadbarium.venue.admin.dto.LoginRequest
import com.svadbarium.venue.admin.dto.LoginResponse
import com.svadbarium.venue.common.exception.TooManyRequestsException
import com.svadbarium.venue.common.exception.UnauthorizedException
import com.svadbarium.venue.common.ratelimit.RateLimiter
import com.svadbarium.venue.common.ratelimit.clientIp
import com.svadbarium.venue.security.JwtService
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Duration

private const val MAX_LOGIN_ATTEMPTS = 5
private val LOGIN_WINDOW: Duration = Duration.ofMinutes(1)

@RestController
@RequestMapping("/api/admin")
class AuthController(
    private val adminUserRepository: AdminUserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
    private val rateLimiter: RateLimiter,
) {
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest, httpRequest: HttpServletRequest): LoginResponse {
        if (!rateLimiter.tryConsume("login:${httpRequest.clientIp()}", MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW)) {
            throw TooManyRequestsException("Too many login attempts. Please try again in a minute.")
        }
        val user = adminUserRepository.findByUsername(request.username)
            ?: throw UnauthorizedException("Invalid username or password")
        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw UnauthorizedException("Invalid username or password")
        }
        return LoginResponse(jwtService.generateToken(user.username))
    }
}
