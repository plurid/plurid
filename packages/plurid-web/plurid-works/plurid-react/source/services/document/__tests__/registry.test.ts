// #region imports
    // #region external
    import {
        createDocumentRegistry,
    } from '../registry';
    // #endregion external
// #endregion imports



// #region module
const tick = () => new Promise<void>((resolve) => { setTimeout(resolve, 0); });


describe('createDocumentRegistry()', () => {
    it('merges the base layers below the in-render entries, in order (a later order wins)', async () => {
        const registry = createDocumentRegistry({ server: true });
        const changes: number[] = [];
        registry.subscribe(() => changes.push(1));

        registry.setBase('route', { title: 'route', description: 'r' });
        registry.setBase('planes', { title: 'plane' });
        const parent = registry.nextOrder();
        const child = registry.nextOrder();
        registry.set(child, { title: 'child', meta: [{ name: 'robots', content: 'index' }] });
        registry.set(parent, { title: 'parent', description: 'p' });

        const snapshot = registry.snapshot();
        expect(snapshot.title).toBe('child');
        expect(snapshot.meta).toEqual([
            { name: 'description', content: 'p' },
            { name: 'robots', content: 'index' },
        ]);
        // one coalesced notification, a microtask after the writes
        expect(changes).toHaveLength(0);
        await tick();
        expect(changes).toHaveLength(1);
        // cached until the next write
        expect(registry.snapshot()).toBe(snapshot);
    });

    it('is idempotent for an equal document and withdraws on remove / empty', async () => {
        const registry = createDocumentRegistry({ server: false });
        const changes: number[] = [];
        registry.subscribe(() => changes.push(1));
        const order = registry.nextOrder();

        registry.set(order, { title: 'a' });
        await tick();
        registry.set(order, { title: 'a' });
        await tick();
        expect(changes).toHaveLength(1);

        registry.set(order, { title: 'b' });
        expect(registry.snapshot().title).toBe('b');
        await tick();
        registry.set(order, {});
        expect(registry.snapshot().title).toBeUndefined();
        await tick();
        registry.remove(order);
        await tick();
        expect(changes).toHaveLength(3);
        expect(registry.server).toBe(false);
    });
});
// #endregion module
