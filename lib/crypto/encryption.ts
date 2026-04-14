/**
 * DeadDrop Ghost Protocol Cryptography
 * Uses the browser's built-in Web Crypto API (AES-256-GCM)
 * Zero external dependencies. Zero server knowledge of content.
 */

/**
 * Generates a random 256-bit AES-GCM key
 * Returns a CryptoKey object
 */
export async function generateKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // extractable
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a message using AES-256-GCM
 * Returns ciphertext, IV, and auth tag (all bundled)
 */
export async function encryptMessage(
  message: string,
  key: CryptoKey
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const encodedMessage = new TextEncoder().encode(message);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encodedMessage
  );

  return { ciphertext, iv };
}

/**
 * Decrypts a message using AES-256-GCM
 * Throws if the auth tag doesn't match (tampered data)
 */
export async function decryptMessage(
  ciphertext: ArrayBuffer,
  iv: Uint8Array,
  key: CryptoKey
): Promise<string> {
  try {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error("Decryption failed — payload may have been tampered with");
  }
}

/**
 * Exports a CryptoKey to a base64 string for URL embedding
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const rawKey = await window.crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(rawKey)));
}

/**
 * Imports a base64 key string back into a CryptoKey
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
  const rawKey = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0));
  
  return window.crypto.subtle.importKey(
    "raw",
    rawKey,
    "AES-GCM",
    false, // not extractable (security measure)
    ["decrypt"]
  );
}

/**
 * Converts ArrayBuffer to base64 for database storage
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/**
 * Converts base64 back to ArrayBuffer from database
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Complete encryption flow: message → encrypted package
 * Returns everything needed to store in DB + put in URL
 */
export async function encryptPayload(
  message: string
): Promise<{
  encryptedPayload: string; // base64 ciphertext
  iv: string;               // base64 IV
  keyString: string;        // base64 key (goes in URL hash, NEVER to server)
}> {
  const key = await generateKey();
  const { ciphertext, iv } = await encryptMessage(message, key);
  const keyString = await exportKey(key);

  return {
    encryptedPayload: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    keyString,
  };
}

/**
 * Complete decryption flow: encrypted package + key → message
 */
export async function decryptPayload(
  encryptedPayload: string,
  iv: string,
  keyString: string
): Promise<string> {
  const key = await importKey(keyString);
  const ciphertext = base64ToArrayBuffer(encryptedPayload);
  const ivBuffer = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

  return decryptMessage(ciphertext, ivBuffer, key);
}
