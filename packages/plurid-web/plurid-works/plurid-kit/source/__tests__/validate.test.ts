/**
 * The configuration check where the server is made (server/validate.ts): a field the kit does not read
 * is named (2026-10-23).
 */

// #region imports
    // #region internal
    import type {
        PluridConfig,
    } from '../index';

    import {
        unknownFields,
        validateConfig,
    } from '../server/validate';
    // #endregion internal
// #endregion imports



// #region module
const config = (
    extra: Record<string, unknown> = {},
) => ({
    serverName: 'validate test',
    hostname: 'localhost',
    routes: [],
    ...extra,
}) as unknown as PluridConfig;


describe('a configuration field the kit does not read', () => {
    it('is named, removed options and misspellings alike', () => {
        expect(unknownFields(config())).toEqual([]);
        expect(unknownFields(config({ helmet: {}, micro: true, hostName: 'x' }))).toEqual(['helmet', 'hostName', 'micro']);
    });

    it('is a warning, not a failure', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            expect(() => validateConfig(config({ helmet: {} }))).not.toThrow();
            expect(warn).toHaveBeenCalledWith(
                '[plurid-kit] the configuration has fields the kit does not read, so they do nothing: helmet',
            );

            warn.mockClear();
            validateConfig(config());
            expect(warn).not.toHaveBeenCalled();
        } finally {
            warn.mockRestore();
        }
    });
});
// #endregion module
