// #region imports
    // #region external
    import {
        resolveRoute,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
/**
 * `resolveRoute` turns what a host writes into the route the space addresses a plane by. Two callers
 * use it and only these shapes reach it: `computeApplication` passes each view item
 * (`services/logic/computing`), and `PluridLink` passes a plane ADDRESS with the application's
 * protocol and host (`components/links/Link`). The commented-out `http://…://static` case
 * (2026-09-13) described a form no caller produces and no current code answers correctly — it is not
 * resurrected here; what is pinned is what the engine actually asks for.
 */
describe('resolveRoute', () => {
    it('a plain plane path resolves to itself', () => {
        expect(resolveRoute('/plane-one')?.route).toBe('/plane-one');
        expect(resolveRoute('/a/b/c')?.route).toBe('/a/b/c');
    });

    it('with a protocol and a host it builds the absolute address a link spawns', () => {
        const resolved = resolveRoute('plurid://origin/geometry', 'plurid', 'origin');
        expect(resolved?.route).toBe('plurid://origin/geometry');
    });

    it('the route a link gives a plane keeps its path, whatever the host', () => {
        const here = resolveRoute('plurid://localhost/docs', 'plurid', 'localhost');
        const elsewhere = resolveRoute('plurid://example.com/docs', 'plurid', 'example.com');
        expect(here?.route).toBe('plurid://localhost/docs');
        expect(elsewhere?.route).toBe('plurid://example.com/docs');
    });
});
// #endregion module
