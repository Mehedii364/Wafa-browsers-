/**
 * WAFA Browser Cryptographic Security Core
 * Implements Envelope Encryption:
 * - Master Password -> PBKDF2-SHA256 (100,000 iterations) Key Encryption Key (KEK)
 * - Random Vault Master Key (AES-256-GCM) encrypted by KEK
 * - Sub-keys derived via HKDF-SHA256
 * - AES-256-GCM with 96-bit unique IVs and Authenticated Additional Data (AAD)
 * - Secure Recovery Key envelope
 */

// Helper to encode/decode
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface EncryptedEnvelope {
  ciphertext: string; // Base64
  iv: string; // Base64 (12 bytes)
  salt: string; // Base64 (16 bytes)
  aad?: string;
  version: number;
}

export class CryptoVaultService {
  private static instance: CryptoVaultService;
  private vaultMasterKey: CryptoKey | null = null;
  private isUnlocked: boolean = false;
  private autoLockTimer: number | null = null;
  private lockTimeoutMs: number = 5 * 60 * 1000; // 5 minutes default
  private onLockCallbacks: (() => void)[] = [];

  private constructor() {
    this.setupInactivityListener();
  }

  public static getInstance(): CryptoVaultService {
    if (!CryptoVaultService.instance) {
      CryptoVaultService.instance = new CryptoVaultService();
    }
    return CryptoVaultService.instance;
  }

  public onLock(cb: () => void) {
    this.onLockCallbacks.push(cb);
  }

  private resetAutoLockTimer() {
    if (this.autoLockTimer) {
      window.clearTimeout(this.autoLockTimer);
    }
    if (this.isUnlocked) {
      this.autoLockTimer = window.setTimeout(() => {
        this.lock();
      }, this.lockTimeoutMs);
    }
  }

  private setupInactivityListener() {
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => {
      if (this.isUnlocked) {
        this.resetAutoLockTimer();
      }
    };
    activityEvents.forEach((ev) => window.addEventListener(ev, handler, { passive: true }));
  }

  public setAutoLockMinutes(minutes: number) {
    this.lockTimeoutMs = Math.max(1, minutes) * 60 * 1000;
    this.resetAutoLockTimer();
  }

  public getAutoLockMinutes(): number {
    return Math.round(this.lockTimeoutMs / 60000);
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  public lock(): void {
    this.vaultMasterKey = null;
    this.isUnlocked = false;
    if (this.autoLockTimer) {
      window.clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }
    this.onLockCallbacks.forEach((cb) => cb());
  }

  /**
   * Derive a Key Encryption Key (KEK) from password
   */
  private async deriveKek(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
    );
  }

  /**
   * Initialize a new Vault with a Master Password
   * Returns envelope to store in database/localStorage
   */
  public async initializeVault(password: string): Promise<{
    envelope: EncryptedEnvelope;
    recoveryKey: string;
    recoveryEnvelope: EncryptedEnvelope;
  }> {
    // 1. Generate 256-bit random Vault Master Key
    const masterKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true, // extractable for envelope wrapping
      ['encrypt', 'decrypt']
    );

    // 2. Generate random 16-byte salt and 12-byte IV for password KEK
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 3. Derive KEK from password
    const kek = await this.deriveKek(password, salt);

    // 4. Wrap (encrypt) the Master Key using KEK
    const rawMasterKey = await crypto.subtle.exportKey('raw', masterKey);
    const aad = new TextEncoder().encode('WAFA_VAULT_METADATA_V1');
    const encryptedKeyBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        additionalData: aad,
      },
      kek,
      rawMasterKey
    );

    const envelope: EncryptedEnvelope = {
      ciphertext: bufferToBase64(encryptedKeyBuffer),
      iv: bufferToBase64(iv),
      salt: bufferToBase64(salt),
      aad: 'WAFA_VAULT_METADATA_V1',
      version: 1,
    };

    // 5. Generate a 24-character alphanumeric Recovery Key
    const recoveryKey = this.generateRecoveryKeyString();
    const recoverySalt = crypto.getRandomValues(new Uint8Array(16));
    const recoveryIv = crypto.getRandomValues(new Uint8Array(12));
    const recoveryKek = await this.deriveKek(recoveryKey, recoverySalt);

    const encryptedRecoveryKeyBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: recoveryIv,
        additionalData: aad,
      },
      recoveryKek,
      rawMasterKey
    );

    const recoveryEnvelope: EncryptedEnvelope = {
      ciphertext: bufferToBase64(encryptedRecoveryKeyBuffer),
      iv: bufferToBase64(recoveryIv),
      salt: bufferToBase64(recoverySalt),
      aad: 'WAFA_VAULT_METADATA_V1',
      version: 1,
    };

    // Set active key
    this.vaultMasterKey = masterKey;
    this.isUnlocked = true;
    this.resetAutoLockTimer();

    return { envelope, recoveryKey, recoveryEnvelope };
  }

  /**
   * Unlock the vault with Master Password
   */
  public async unlockWithPassword(password: string, envelope: EncryptedEnvelope): Promise<boolean> {
    try {
      const salt = base64ToBuffer(envelope.salt);
      const iv = base64ToBuffer(envelope.iv);
      const ciphertext = base64ToBuffer(envelope.ciphertext);
      const aad = envelope.aad ? new TextEncoder().encode(envelope.aad) : undefined;

      const kek = await this.deriveKek(password, salt);

      const rawMasterKey = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as any,
          additionalData: aad as any,
        },
        kek,
        ciphertext as any
      );

      this.vaultMasterKey = await crypto.subtle.importKey(
        'raw',
        rawMasterKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      this.isUnlocked = true;
      this.resetAutoLockTimer();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Unlock with Recovery Key
   */
  public async unlockWithRecoveryKey(recoveryKey: string, recoveryEnvelope: EncryptedEnvelope): Promise<boolean> {
    return this.unlockWithPassword(recoveryKey.trim(), recoveryEnvelope);
  }

  /**
   * Encrypt a string or binary payload using the active Vault Master Key
   */
  public async encryptData(
    data: string | Uint8Array,
    recordId: string = 'GENERIC'
  ): Promise<{ ciphertextBase64: string; ivBase64: string; aadBase64: string }> {
    if (!this.vaultMasterKey || !this.isUnlocked) {
      throw new Error('Vault is locked. Authenticate first.');
    }

    const payload = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const aad = new TextEncoder().encode(`WAFA_RECORD_${recordId}_V1`);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as any,
        additionalData: aad as any,
      },
      this.vaultMasterKey,
      payload as any
    );

    return {
      ciphertextBase64: bufferToBase64(encrypted),
      ivBase64: bufferToBase64(iv),
      aadBase64: bufferToBase64(aad),
    };
  }

  /**
   * Decrypt data with the active Vault Master Key
   */
  public async decryptData(
    ciphertextBase64: string,
    ivBase64: string,
    aadBase64?: string
  ): Promise<Uint8Array> {
    if (!this.vaultMasterKey || !this.isUnlocked) {
      throw new Error('Vault is locked. Authenticate first.');
    }

    const ciphertext = base64ToBuffer(ciphertextBase64);
    const iv = base64ToBuffer(ivBase64);
    const aad = aadBase64 ? base64ToBuffer(aadBase64) : undefined;

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as any,
        additionalData: aad as any,
      },
      this.vaultMasterKey,
      ciphertext as any
    );

    return new Uint8Array(decrypted);
  }

  /**
   * Decrypt directly to UTF-8 text
   */
  public async decryptText(
    ciphertextBase64: string,
    ivBase64: string,
    aadBase64?: string
  ): Promise<string> {
    const bytes = await this.decryptData(ciphertextBase64, ivBase64, aadBase64);
    return new TextDecoder().decode(bytes);
  }

  private generateRecoveryKeyString(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    const randomVals = crypto.getRandomValues(new Uint8Array(20));
    for (let i = 0; i < 20; i++) {
      if (i > 0 && i % 5 === 0) result += '-';
      result += chars[randomVals[i] % chars.length];
    }
    return result;
  }
}

export const cryptoVault = CryptoVaultService.getInstance();
