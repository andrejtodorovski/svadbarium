package com.svadbarium.venue.menu

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MenuFileRepository : JpaRepository<MenuFile, Long> {
    fun findAllByOrderBySortOrderAsc(): List<MenuFile>
}
