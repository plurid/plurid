// #region imports
    // #region internal
    import {
        serviceProperties,
    } from '../shared';
    // #endregion internal
// #endregion imports



// #region module
/**
 * A SERVICE'S CLIENT REACHES ITS PROVIDER ON THE CLIENT (2026-10-20). `client` (the Apollo client's
 * factory) was declared and documented, and never read: the provider rendered without its client,
 * which Apollo's provider refuses.
 */
describe('serviceProperties()', () => {
    const Provider = () => null;

    it('builds the client once on the client, and leaves the server\'s to the preserve', () => {
        const instance = { cache: {} };
        const client = jest.fn(() => instance);
        expect(serviceProperties({ name: 'Apollo', Provider, client }, 'client').client).toBe(instance);
        expect(client).toHaveBeenCalledTimes(1);
        // per request on the server: a client for the whole server would share its cache with everyone
        expect(serviceProperties({ name: 'Apollo', Provider, client }, 'server').client).toBeUndefined();
        expect(client).toHaveBeenCalledTimes(1);
    });

    it('builds no store on the server: each request\'s comes from the factory (2026-10-21)', () => {
        // One `store(undefined)` at startup was the store every request rendered into.
        const store = jest.fn((state?: unknown) => ({ state }));
        expect(serviceProperties({ name: 'redux', Provider, store }, 'server').store).toBeUndefined();
        expect(store).not.toHaveBeenCalled();
        expect(serviceProperties({ name: 'redux', Provider, store }, 'client', { count: 1 }).store).toEqual({ state: { count: 1 } });
    });

    it('keeps a client the static properties already give', () => {
        const given = { given: true };
        const client = jest.fn(() => ({}));
        expect(serviceProperties({ name: 'Apollo', Provider, client, properties: { client: given } }, 'client').client).toBe(given);
        expect(client).not.toHaveBeenCalled();
    });
});
// #endregion module
