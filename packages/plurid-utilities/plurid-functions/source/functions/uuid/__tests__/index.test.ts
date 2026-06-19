// #region imports
    // #region external
    import {
        v4Browser,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
describe('uuid v4Browser', () => {
    // Node 18+ provides globalThis.crypto.getRandomValues natively; only shim if missing.
    // The previous version polyfilled `self.crypto`, which crashed under jest's node
    // testEnvironment where `self` is undefined ("Object.defineProperty on non-object").
    const g: any = globalThis;
    if (!g.crypto || typeof g.crypto.getRandomValues !== 'function') {
        const nodeCrypto = require('crypto');
        g.crypto = {
            ...(g.crypto || {}),
            getRandomValues: (arr: any) => nodeCrypto.randomBytes(arr.length),
        };
    }

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
