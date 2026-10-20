// #region imports
    // #region libraries
    import fs from 'fs';
    // #endregion libraries


    // #region internal
    import {
        PluridPaths,
    } from './paths';
    // #endregion internal
// #endregion imports



// #region module
export type PluridBuildMode = 'development' | 'production';

/**
 * THE BUILD'S MODE, in its asset manifest (2026-10-20). `plurid dev` and `plurid build` write the same
 * `buildDir`, and `plurid start` ran whatever was there: a development build, unminified, its source
 * maps public, its constants on the local mesh, under a production environment.
 */
export const writeBuildManifest = (
    paths: PluridPaths,
    manifest: { mode: PluridBuildMode; main?: string },
): void => {
    fs.mkdirSync(paths.buildDir, { recursive: true });
    fs.writeFileSync(paths.assetManifest, JSON.stringify(manifest, null, 2));
};

/** The mode the manifest names; a manifest from before modes, with its `main`, is a production build's. */
export const readBuildMode = (
    paths: PluridPaths,
): PluridBuildMode | undefined => {
    try {
        const manifest = JSON.parse(fs.readFileSync(paths.assetManifest, 'utf8'));
        if (manifest?.mode === 'development' || manifest?.mode === 'production') {
            return manifest.mode;
        }
        return typeof manifest?.main === 'string' ? 'production' : undefined;
    } catch {
        return undefined;
    }
};
// #endregion module
