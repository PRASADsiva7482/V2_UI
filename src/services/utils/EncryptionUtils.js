import CryptoJS from 'crypto-js';

/**
 * Utility for AES encryption and decryption.
 * Uses the same key and IV as the backend.
 */
const EncryptionUtils = {
    // Key: 'v-app-dev' padded to 16 bytes with 0
    // IV: 'v-app-iv-salt-12' (16 bytes)

    getKeyAndIv: () => {
        const keyStr = 'v-app-dev';
        const ivStr = 'v-app-iv-salt-12';

        // Match Java's behavior: new byte[16] then copy bytes. Trailing bytes are 0.
        // Convert to hex and pad with '0' to reach 32 chars (16 bytes)
        const keyBase = CryptoJS.enc.Utf8.parse(keyStr);
        const keyHex = CryptoJS.enc.Hex.stringify(keyBase).padEnd(32, '0');
        const finalKey = CryptoJS.enc.Hex.parse(keyHex);

        // Same for IV
        const ivBase = CryptoJS.enc.Utf8.parse(ivStr);
        const ivHex = CryptoJS.enc.Hex.stringify(ivBase).padEnd(32, '0');
        const finalIv = CryptoJS.enc.Hex.parse(ivHex);

        return { key: finalKey, iv: finalIv };
    },

    /**
     * Encrypts plain text
     */
    encrypt: (plainText) => {
        if (!plainText) return plainText;
        try {
            const { key, iv } = EncryptionUtils.getKeyAndIv();
            const encrypted = CryptoJS.AES.encrypt(plainText, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            // Match Java's Base64 output of raw ciphertext
            return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
        } catch (error) {
            console.error('Encryption error:', error);
            return plainText;
        }
    },

    /**
     * Decrypts encrypted text
     */
    decrypt: (encryptedText) => {
        if (!encryptedText) return encryptedText;
        try {
            const { key, iv } = EncryptionUtils.getKeyAndIv();

            // Explicitly parse base64 string to CipherParams
            const cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: CryptoJS.enc.Base64.parse(encryptedText)
            });

            const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Decryption error:', error);
            return encryptedText;
        }
    }
};

export default EncryptionUtils;
