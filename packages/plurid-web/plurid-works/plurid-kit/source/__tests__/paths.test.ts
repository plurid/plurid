import {
    resolvePaths,
} from '../cli/paths';



describe('resolvePaths (C13)', () => {
    it('defaults to build/ and source/public', () => {
        expect(resolvePaths()).toEqual({
            buildDir: 'build',
            clientDir: 'build/client',
            serverEntry: 'build/index.js',
            assetManifest: 'build/asset-manifest.json',
            publicDir: 'source/public',
            builtPublicDir: 'build/public',
        });
    });

    it('a configured buildDir / publicDir governs every derived path', () => {
        expect(resolvePaths({ buildDir: 'dist/', publicDir: 'static' })).toEqual({
            buildDir: 'dist',
            clientDir: 'dist/client',
            serverEntry: 'dist/index.js',
            assetManifest: 'dist/asset-manifest.json',
            publicDir: 'static',
            builtPublicDir: 'dist/public',
        });
    });
});
