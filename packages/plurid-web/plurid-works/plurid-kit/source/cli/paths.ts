// #region imports
    // #region libraries
    import path from 'path';
    // #endregion libraries
// #endregion imports



// #region module
export interface PluridPaths {
    /** Build output directory (`buildDir`, default `build`), relative to the working directory. */
    buildDir: string;
    /** The client bundle's directory inside it. */
    clientDir: string;
    /** The server entry inside it. */
    serverEntry: string;
    /** The asset manifest `plurid build` writes and the runtime reads. */
    assetManifest: string;
    /** Static assets (`publicDir`, default `source/public`). */
    publicDir: string;
    /** Where `plurid build` copies the public directory. */
    builtPublicDir: string;
}

/**
 * THE ONE resolution of the application's directories (C13, 2026-09-06): `plurid dev`, `build`,
 * `start`, the asset manifest and the server's defaults all read these, so a configured `buildDir`
 * or `publicDir` governs the whole toolchain instead of the runtime alone.
 */
export const resolvePaths = (
    config: { buildDir?: string; publicDir?: string } = {},
): PluridPaths => {
    const buildDir = normalize(config.buildDir || 'build');
    const publicDir = normalize(config.publicDir || 'source/public');
    return {
        buildDir,
        clientDir: path.posix.join(buildDir, 'client'),
        serverEntry: path.posix.join(buildDir, 'index.js'),
        assetManifest: path.posix.join(buildDir, 'asset-manifest.json'),
        publicDir,
        builtPublicDir: path.posix.join(buildDir, 'public'),
    };
};

const normalize = (
    value: string,
) => value.replace(/\\/g, '/').replace(/\/+$/, '') || '.';
// #endregion module
