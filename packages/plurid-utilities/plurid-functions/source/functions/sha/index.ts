// #region module
const browserDigestMessage = async (
    message: string,
    algorithm: string = 'sha256',
): Promise<string> => {
    algorithm = algorithm.toUpperCase().replace('SHA', 'SHA-');

    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest(algorithm, msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}


const compute = async (
    data: string,
    algorithm: string = 'sha256',
): Promise<string> => {
    if (typeof window !== 'undefined') {
        return await browserDigestMessage(
            data,
            algorithm,
        );
    }

    // FORCE prevent webpack bundling
    const crypto = eval('require')('crypto'); // eslint-disable-line no-eval
    return crypto
        .createHash(algorithm)
        .update(data)
        .digest('hex');
}
// #endregion module



// #region exports
export {
    compute,
};
// #endregion exports
