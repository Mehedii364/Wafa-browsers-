package site.wafazone.browser

import android.app.Application
import site.wafazone.browser.data.WafaDatabase

class WafaApplication : Application() {
    val database: WafaDatabase by lazy { WafaDatabase.getDatabase(this) }
}
