package site.wafazone.browser.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "browser_tabs")
data class BrowserTabEntity(
    @PrimaryKey val id: String,
    val url: String,
    val title: String,
    val isPinned: Boolean = false,
    val isSuspended: Boolean = false,
    val lastActiveTime: Long = System.currentTimeMillis(),
    val desktopMode: Boolean = false,
    val readerMode: Boolean = false,
    val trackersBlocked: Int = 0
)

@Entity(tableName = "bookmarks")
data class BookmarkEntity(
    @PrimaryKey val id: String,
    val url: String,
    val title: String,
    val folder: String = "Default",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "history_records")
data class HistoryEntity(
    @PrimaryKey val id: String,
    val url: String,
    val title: String,
    val visitedAt: Long = System.currentTimeMillis(),
    val visitCount: Int = 1
)

@Entity(tableName = "vault_items")
data class VaultItemEntity(
    @PrimaryKey val id: String,
    val title: String,
    val category: String, // photos, videos, documents, notes, bookmarks
    val mimeType: String,
    val sizeBytes: Long,
    val encryptedBlob: ByteArray,
    val iv: ByteArray,
    val isFavorite: Boolean = false,
    val isTrashed: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val notes: String? = null
)

@Entity(tableName = "encrypted_credentials")
data class EncryptedCredentialEntity(
    @PrimaryKey val id: String,
    val title: String,
    val website: String,
    val username: String,
    val encryptedPassword: ByteArray,
    val iv: ByteArray,
    val category: String = "Logins",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "vault_envelope")
data class VaultKeyEnvelopeEntity(
    @PrimaryKey val id: Int = 1,
    val encryptedMasterKey: ByteArray,
    val iv: ByteArray,
    val salt: ByteArray,
    val version: Int = 1,
    val recoveryEnvelope: ByteArray? = null
)
