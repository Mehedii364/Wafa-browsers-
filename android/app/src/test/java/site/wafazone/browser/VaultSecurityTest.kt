package site.wafazone.browser

import org.junit.Assert.*
import org.junit.Test
import site.wafazone.browser.security.VaultSecurityCore
import site.wafazone.browser.shield.ContentBlocker

class VaultSecurityTest {

    @Test
    fun testVaultInitializationAndCorrectPasswordUnlock() {
        val password = "MySecureMasterPassword@2026".toCharArray()
        val (envelope, recoveryKey) = VaultSecurityCore.initializeVault(password)

        assertNotNull(envelope)
        assertTrue(envelope.ciphertext.isNotEmpty())
        assertEquals(16, envelope.salt.size)
        assertEquals(12, envelope.iv.size)
        assertTrue(recoveryKey.isNotEmpty())

        // Lock vault
        VaultSecurityCore.lock()
        assertFalse(VaultSecurityCore.isVaultUnlocked)

        // Unlock with correct password
        val unlockSuccess = VaultSecurityCore.unlock(password, envelope)
        assertTrue("Vault must unlock with correct password", unlockSuccess)
        assertTrue(VaultSecurityCore.isVaultUnlocked)
    }

    @Test
    fun testIncorrectPasswordRejection() {
        val password = "RealMasterPassword123".toCharArray()
        val wrongPassword = "WrongMasterPassword999".toCharArray()

        val (envelope, _) = VaultSecurityCore.initializeVault(password)
        VaultSecurityCore.lock()

        val unlockAttempt = VaultSecurityCore.unlock(wrongPassword, envelope)
        assertFalse("Vault must strictly reject incorrect password", unlockAttempt)
        assertFalse(VaultSecurityCore.isVaultUnlocked)
    }

    @Test
    fun testPayloadEncryptionDecryptionRoundtrip() {
        val password = "TopSecretVaultPassword".toCharArray()
        val (envelope, _) = VaultSecurityCore.initializeVault(password)

        val confidentialDoc = "WAFA CONFIDENTIAL: Financial statements & passwords 2026"
        val (ciphertext, iv) = VaultSecurityCore.encrypt(confidentialDoc.toByteArray(Charsets.UTF_8), "DOC_101")

        assertFalse(ciphertext.contentEquals(confidentialDoc.toByteArray(Charsets.UTF_8)))

        val decryptedBytes = VaultSecurityCore.decrypt(ciphertext, iv, "DOC_101")
        val decryptedText = String(decryptedBytes, Charsets.UTF_8)

        assertEquals(confidentialDoc, decryptedText)
    }

    @Test
    fun testContentBlockerDetectsTrackers() {
        assertTrue(ContentBlocker.isBlocked("https://www.google-analytics.com/analytics.js"))
        assertTrue(ContentBlocker.isBlocked("https://connect.facebook.net/en_US/fbevents.js"))
        assertTrue(ContentBlocker.isBlocked("https://secure.criteo.com/delivery/ld.js"))
        assertFalse(ContentBlocker.isBlocked("https://en.wikipedia.org/wiki/Kotlin"))
    }
}
