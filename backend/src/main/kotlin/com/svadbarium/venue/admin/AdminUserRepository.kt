package com.svadbarium.venue.admin

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AdminUserRepository : JpaRepository<AdminUser, Long> {
    fun findByUsername(username: String): AdminUser?
}
