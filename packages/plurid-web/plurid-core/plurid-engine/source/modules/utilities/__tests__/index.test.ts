// #region imports
    // #region libraries
    import vm from 'node:vm';
    // #endregion libraries


    // #region external
    import {
        isDevelopment,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE PRODUCTION SWITCH reaches a browser through a bundler's `define`, which replaces the exact
 * chain `process.env.NODE_ENV` in the shipped code of a page that has no `process` at all. A guard
 * around it (`typeof process`, `process.env?.`) left every browser build reading as development, so
 * the engine's development warnings printed in production (2026-10-19).
 */
describe('isDevelopment', () => {
    const page = (source: string) => vm.runInNewContext('(' + source + ')') as () => boolean;

    it('reads as production in a browser build, where the bundler replaced the chain', () => {
        const bundled = isDevelopment.toString().replaceAll('process.env.NODE_ENV', '"production"');

        expect(page(bundled)()).toBe(false);
    });

    it('reads as development in an unbundled page, which has no process', () => {
        expect(page(isDevelopment.toString())()).toBe(true);
    });

    it('follows NODE_ENV under Node', () => {
        const previous = process.env.NODE_ENV;
        try {
            process.env.NODE_ENV = 'production';
            expect(isDevelopment()).toBe(false);
            process.env.NODE_ENV = 'development';
            expect(isDevelopment()).toBe(true);
        } finally {
            if (previous === undefined) {
                delete process.env.NODE_ENV;
            } else {
                process.env.NODE_ENV = previous;
            }
        }
    });
});
// #endregion module
