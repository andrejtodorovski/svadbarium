package com.svadbarium.venue.config

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping

// Spring's static resource handler only serves index.html at "/" — a direct load or refresh on any
// other Angular client-side route (e.g. /calendar) would otherwise 404 instead of letting the
// Angular router take over. Forward exactly the known client routes to index.html.
@Controller
class SpaFallbackController {
    @GetMapping(
        "/calendar",
        "/menu",
        "/admin",
        "/admin/login",
        "/admin/settings",
        "/admin/gallery",
        "/admin/menus",
        "/admin/availability",
    )
    fun forwardToIndex(): String = "forward:/index.html"
}
