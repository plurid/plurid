// #region module
const compute = async (
    data: string,
    algorithm: string = 'sha256',
): Promise<string> => {
    // Web Crypto (`crypto.subtle`) is available in browsers and Node >= 19, so a single path
    // covers both. This replaces the old browser/Node split + the `eval('require')('crypto')`
    // hack (whose only purpose was hiding the Node require from bundlers).
    const subtleAlgorithm = algorithm.toUpperCase().replace('SHA', 'SHA-');
    const messageBytes = new TextEncoder().encode(data);
    const hashBuffer = await globalThis.crypto.subtle.digest(subtleAlgorithm, messageBytes);
    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}
// #endregion module



// #region exports
export {
    compute,
};
// #endregion exports
