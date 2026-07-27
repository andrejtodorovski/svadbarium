package com.svadbarium.venue.admin

import com.svadbarium.venue.admin.dto.LoginRequest
import com.svadbarium.venue.admin.dto.LoginResponse
import com.svadbarium.venue.common.exception.UnauthorizedException
import com.svadbarium.venue.security.JwtService
import jakarta.validation.Valid
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/admin")
class AuthController(
    private val adminUserRepository: AdminUserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
) {
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): LoginResponse {
        val user = adminUserRepository.findByUsername(request.username)
            ?: throw UnauthorizedException("Invalid username or password")
        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw UnauthorizedException("Invalid username or password")
        }
        return LoginResponse(jwtService.generateToken(user.username))
    }
}
