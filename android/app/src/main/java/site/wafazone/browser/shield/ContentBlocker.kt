package site.wafazone.browser.shield

import android.webkit.WebResourceResponse
import java.io.ByteArrayInputStream

/**
 * WAFA Browser Privacy Shield Content Interceptor
 * Intercepts network calls made by WebView and blocks known tracking and ad beacons.
 */
object ContentBlocker {

    private val TRACKER_DOMAINS = hashSetOf(
        "google-analytics.com",
        "googletagmanager.com",
        "doubleclick.net",
        "facebook.net",
        "connect.facebook.net",
        "criteo.com",
        "criteo.net",
        "taboola.com",
        "outbrain.com",
        "scorecardresearch.com",
        "quantserve.com",
        "hotjar.com",
        "clarity.ms"
    )

    fun isBlocked(url: String): Boolean {
        val lowerUrl = url.lowercase()
        for (domain in TRACKER_DOMAINS) {
            if (lowerUrl.contains(domain)) {
                return true
            }
        }
        return false
    }

    fun createEmptyResponse(): WebResourceResponse {
        return WebResourceResponse(
            "text/plain",
            "UTF-8",
            ByteArrayInputStream("".toByteArray(Charsets.UTF_8))
        )
    }
}
