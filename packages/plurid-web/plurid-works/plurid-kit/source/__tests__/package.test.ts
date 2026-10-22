// #region imports
    // #region libraries
    import fs from 'fs';
    import path from 'path';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * THE SUBPATHS RESOLVE UNDER `moduleResolution: "node"` TOO (2026-10-22). TypeScript's older resolution
 * reads no `exports`, so `@plurid/plurid-kit/server` and `/client` had no types in the applications that
 * use it (most of the plurid applications): `typesVersions` names them, and has to follow `exports`.
 */
describe('package.json', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));

    it('gives every exported subpath its types for the older module resolution', () => {
        const subpaths = Object.keys(manifest.exports)
            .filter((key) => key !== '.' && !key.endsWith('.json'))
            .map((key) => key.replace(/^\.\//, ''));
        const versions = manifest.typesVersions?.['*'] ?? {};

        expect(Object.keys(versions).sort()).toEqual(subpaths.sort());
        for (const subpath of subpaths) {
            expect(versions[subpath]).toEqual([manifest.exports['./' + subpath].require.types]);
        }
    });
});
// #endregion module
