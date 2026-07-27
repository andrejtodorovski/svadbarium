package com.svadbarium.venue.admin

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "admin_user")
class AdminUser(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    var username: String = "",

    @Column(name = "password_hash")
    var passwordHash: String = "",

    @Column(name = "created_at")
    var createdAt: Instant = Instant.now(),
)
