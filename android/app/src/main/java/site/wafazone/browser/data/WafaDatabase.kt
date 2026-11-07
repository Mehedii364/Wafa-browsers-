package site.wafazone.browser.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        BrowserTabEntity::class,
        BookmarkEntity::class,
        HistoryEntity::class,
        VaultItemEntity::class,
        EncryptedCredentialEntity::class,
        VaultKeyEnvelopeEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class WafaDatabase : RoomDatabase() {

    abstract fun browserDao(): BrowserDao
    abstract fun vaultDao(): VaultDao

    companion object {
        @Volatile
        private var INSTANCE: WafaDatabase? = null

        fun getDatabase(context: Context): WafaDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    WafaDatabase::class.java,
                    "wafa_browser_database.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
