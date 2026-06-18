// #region imports
    // #region external
    import {
        v4Browser,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
describe('uuid v4Browser', () => {
    // handle crypto for jest - https://stackoverflow.com/a/52612372
    const crypto = require('crypto');
    Object.defineProperty((global as any).self, 'crypto', {
        value: {
            getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
        },
    });

    it('generates random uuid', () => {
        const uuid = v4Browser();
        expect(uuid.length).toBe(32);
    });

    it('generates random uuid with separator', () => {
        const uuid = v4Browser('-');
        expect(uuid.length).toBe(36);
    });
});
// #endregion module
