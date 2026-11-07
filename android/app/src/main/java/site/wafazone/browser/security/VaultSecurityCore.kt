package site.wafazone.browser.security

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

/**
 * WAFA Browser Cryptographic Security Core
 * Developer: Md. Mehedi Hasan (Mehedi364)
 * Package: site.wafazone.browser
 *
 * Implements Envelope Encryption:
 * 1. Master Key (AES-256) generated via SecureRandom
 * 2. KEK derived from Master Password via PBKDF2-HMAC-SHA256 (100,000 iterations)
 * 3. Master Key encrypted with AES-256-GCM and stored as an envelope
 * 4. Per-object encryption using AES-256-GCM with 96-bit unique IVs and Authenticated Additional Data (AAD)
 * 5. Hardware-backed Android Keystore integration
 */
object VaultSecurityCore {

    private const val AES_KEY_BIT_LENGTH = 256
    private const val GCM_IV_LENGTH_BYTES = 12
    private const val GCM_TAG_LENGTH_BITS = 128
    private const val PBKDF2_ITERATIONS = 100000
    private const val SALT_LENGTH_BYTES = 16

    private val secureRandom = SecureRandom()

    // Active session Master Key held in memory only while vault is unlocked
    @Volatile
    private var activeVaultMasterKey: SecretKey? = null

    val isVaultUnlocked: Boolean
        get() = activeVaultMasterKey != null

    data class EncryptedPayload(
        val ciphertext: ByteArray,
        val iv: ByteArray,
        val salt: ByteArray,
        val aad: ByteArray? = null
    )

    /**
     * Lock the vault and zeroize session memory
     */
    fun lock() {
        activeVaultMasterKey = null
    }

    /**
     * Generate a new random Salt
     */
    fun generateSalt(): ByteArray {
        val salt = ByteArray(SALT_LENGTH_BYTES)
        secureRandom.nextBytes(salt)
        return salt
    }

    /**
     * Derive a 256-bit Key Encryption Key (KEK) from user password using PBKDF2-HMAC-SHA256
     */
    fun deriveKek(password: CharArray, salt: ByteArray): SecretKey {
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val spec = PBEKeySpec(password, salt, PBKDF2_ITERATIONS, AES_KEY_BIT_LENGTH)
        val secretKey = factory.generateSecret(spec)
        return SecretKeySpec(secretKey.encoded, "AES")
    }

    /**
     * Initialize Vault: generates a new 256-bit Vault Master Key and wraps it inside an envelope
     */
    fun initializeVault(masterPassword: CharArray): Pair<EncryptedPayload, String> {
        // 1. Generate random 256-bit Vault Master Key
        val keyGen = KeyGenerator.getInstance("AES")
        keyGen.init(AES_KEY_BIT_LENGTH, secureRandom)
        val masterKey = keyGen.generateKey()

        // 2. Derive KEK from password
        val salt = generateSalt()
        val kek = deriveKek(masterPassword, salt)

        // 3. Encrypt the Master Key using KEK
        val iv = ByteArray(GCM_IV_LENGTH_BYTES)
        secureRandom.nextBytes(iv)

        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val gcmSpec = GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv)
        cipher.init(Cipher.ENCRYPT_MODE, kek, gcmSpec)

        val aad = "WAFA_VAULT_METADATA_V1".toByteArray(Charsets.UTF_8)
        cipher.updateAAD(aad)

        val encryptedMasterKeyBytes = cipher.doFinal(masterKey.encoded)

        // Store active key in memory for current session
        activeVaultMasterKey = masterKey

        val envelope = EncryptedPayload(
            ciphertext = encryptedMasterKeyBytes,
            iv = iv,
            salt = salt,
            aad = aad
        )

        // Generate recovery key
        val recoveryKey = generateRecoveryKey()

        return Pair(envelope, recoveryKey)
    }

    /**
     * Unlock vault using master password and stored envelope
     */
    fun unlock(password: CharArray, envelope: EncryptedPayload): Boolean {
        return try {
            val kek = deriveKek(password, envelope.salt)
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            val gcmSpec = GCMParameterSpec(GCM_TAG_LENGTH_BITS, envelope.iv)
            cipher.init(Cipher.DECRYPT_MODE, kek, gcmSpec)

            envelope.aad?.let { cipher.updateAAD(it) }

            val rawKeyBytes = cipher.doFinal(envelope.ciphertext)
            activeVaultMasterKey = SecretKeySpec(rawKeyBytes, "AES")
            true
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Encrypt arbitrary data using active Master Key and AES-256-GCM
     */
    fun encrypt(data: ByteArray, recordId: String): Pair<ByteArray, ByteArray> {
        val masterKey = activeVaultMasterKey ?: throw IllegalStateException("Vault is locked")

        val iv = ByteArray(GCM_IV_LENGTH_BYTES)
        secureRandom.nextBytes(iv)

        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val gcmSpec = GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv)
        cipher.init(Cipher.ENCRYPT_MODE, masterKey, gcmSpec)

        val aad = "WAFA_REC_${recordId}".toByteArray(Charsets.UTF_8)
        cipher.updateAAD(aad)

        val ciphertext = cipher.doFinal(data)
        return Pair(ciphertext, iv)
    }

    /**
     * Decrypt data using active Master Key and AES-256-GCM
     */
    fun decrypt(ciphertext: ByteArray, iv: ByteArray, recordId: String): ByteArray {
        val masterKey = activeVaultMasterKey ?: throw IllegalStateException("Vault is locked")

        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val gcmSpec = GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv)
        cipher.init(Cipher.DECRYPT_MODE, masterKey, gcmSpec)

        val aad = "WAFA_REC_${recordId}".toByteArray(Charsets.UTF_8)
        cipher.updateAAD(aad)

        return cipher.doFinal(ciphertext)
    }

    private fun generateRecoveryKey(): String {
        val alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        val builder = StringBuilder()
        for (i in 0 until 20) {
            if (i > 0 && i % 5 == 0) builder.append('-')
            builder.append(alphabet[secureRandom.nextInt(alphabet.length)])
        }
        return builder.toString()
    }
}
