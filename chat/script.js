
async function decrypt_chat(user, password, files) {
    if (files.files.length === 0) {
        // HTML OUTPUT WARNING
        return;
    }
    const file = files.files[0];
    const fileBuffer = await file.arrayBuffer();
    try {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const hash_string = user + password;
        const stringbuffer = encoder.encode(hash_string);
        const hashBuffer = await crypto.subtle.digest('SHA-256', stringbuffer);

        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            hashBuffer,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );
        const fileBuffPack = new Uint8Array(fileBuffer);
        const iv = fileBuffPack.slice(0, 12);
        const encryptedContent = fileBuffPack.slice(12);
        const decryptedContentBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            cryptoKey,
            encryptedContent
        );
        const decoded = decoder.decode(decryptedContentBuffer);
        let jsonData;
        try {
            jsonData = JSON.parse(decoded);
        } catch (jsonError) {
            // HTML OUTPUT ERROR
            return;
        }
        

    } catch (error) {
        // HTML OUTPUT ERROR
    }
}
