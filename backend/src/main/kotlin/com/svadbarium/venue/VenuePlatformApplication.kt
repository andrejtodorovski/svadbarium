package com.svadbarium.venue

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import java.net.URI

@SpringBootApplication
@ConfigurationPropertiesScan
class VenuePlatformApplication

fun main(args: Array<String>) {
	convertDatabaseUrlIfNeeded()
	runApplication<VenuePlatformApplication>(*args)
}

// Railway/Render inject DATABASE_URL as postgres://user:pass@host:port/db, not a JDBC URL. Rewrite
// it into the jdbc:postgresql:// form (plus separate username/password) before Spring reads it.
private fun convertDatabaseUrlIfNeeded() {
	val raw = System.getenv("DATABASE_URL") ?: return
	if (raw.startsWith("jdbc:")) return

	val uri = URI(raw)
	val (username, password) = uri.userInfo
		?.split(":", limit = 2)
		?.let { it[0] to (it.getOrNull(1) ?: "") }
		?: (null to null)

	System.setProperty("spring.datasource.url", "jdbc:postgresql://${uri.host}:${uri.port}${uri.path}")
	username?.let { System.setProperty("spring.datasource.username", it) }
	password?.let { System.setProperty("spring.datasource.password", it) }
}
