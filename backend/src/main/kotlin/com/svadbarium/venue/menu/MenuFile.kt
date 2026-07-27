package com.svadbarium.venue.menu

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "menu_file")
class MenuFile(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "file_data", columnDefinition = "bytea")
    var fileData: ByteArray = ByteArray(0),

    @Column(name = "content_type")
    var contentType: String = "",

    @Column(name = "file_size")
    var fileSize: Int = 0,

    var title: String? = null,

    @Column(name = "sort_order")
    var sortOrder: Int = 0,

    @Column(name = "created_at")
    var createdAt: Instant = Instant.now(),
)
