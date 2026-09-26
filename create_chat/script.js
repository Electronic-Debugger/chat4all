async function create_chat(user, password) {
    const encoder = new TextEncoder();
    const hash_string = user + password;
    const buffer = encoder.encode(hash_string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hash = await crypto.subtle.importKey(
        "raw",
        hashBuffer,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = encoder.encode('{"init": "ok"}');
    const encryptedContent = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        hash,
        encodedData
    );
    const data = new Uint8Array(iv.byteLength + encryptedContent.byteLength);
    data.set(iv, 0);
    data.set(new Uint8Array(encryptedContent), iv.byteLength);
    const blob = new Blob([data], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "chat4all.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

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
        console.log("File decifrato con successo!");
        document.getElementById('risultato').textContent = "Contenuto recuperato:\n" + testoInChiaro;

    } catch (error) {
        // HTML OUTPUT ERROR
    }
}
