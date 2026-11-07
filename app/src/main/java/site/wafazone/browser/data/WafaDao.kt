package site.wafazone.browser.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface BrowserDao {
    @Query("SELECT * FROM browser_tabs ORDER BY isPinned DESC, lastActiveTime DESC")
    fun getAllTabs(): Flow<List<BrowserTabEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateTab(tab: BrowserTabEntity)

    @Delete
    suspend fun deleteTab(tab: BrowserTabEntity)

    @Query("DELETE FROM browser_tabs")
    suspend fun clearAllTabs()

    @Query("SELECT * FROM bookmarks ORDER BY createdAt DESC")
    fun getAllBookmarks(): Flow<List<BookmarkEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBookmark(bookmark: BookmarkEntity)

    @Delete
    suspend fun deleteBookmark(bookmark: BookmarkEntity)

    @Query("SELECT * FROM history_records ORDER BY visitedAt DESC LIMIT 200")
    fun getRecentHistory(): Flow<List<HistoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun recordHistory(history: HistoryEntity)

    @Query("DELETE FROM history_records")
    suspend fun clearHistory()
}

@Dao
interface VaultDao {
    @Query("SELECT * FROM vault_items WHERE isTrashed = 0 ORDER BY createdAt DESC")
    fun getActiveVaultItems(): Flow<List<VaultItemEntity>>

    @Query("SELECT * FROM vault_items WHERE isTrashed = 1 ORDER BY createdAt DESC")
    fun getTrashedVaultItems(): Flow<List<VaultItemEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVaultItem(item: VaultItemEntity)

    @Delete
    suspend fun deleteVaultItem(item: VaultItemEntity)

    @Query("SELECT * FROM encrypted_credentials ORDER BY updatedAt DESC")
    fun getAllCredentials(): Flow<List<EncryptedCredentialEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCredential(credential: EncryptedCredentialEntity)

    @Delete
    suspend fun deleteCredential(credential: EncryptedCredentialEntity)

    @Query("SELECT * FROM vault_envelope WHERE id = 1 LIMIT 1")
    suspend fun getEnvelope(): VaultKeyEnvelopeEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveEnvelope(envelope: VaultKeyEnvelopeEntity)
}
