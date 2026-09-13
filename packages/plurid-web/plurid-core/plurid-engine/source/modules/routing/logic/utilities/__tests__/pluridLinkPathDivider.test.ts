// #region imports
    // #region external
    import {
        pluridLinkPathDivider,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
/**
 * `pluridLinkPathDivider` cuts a link into the divisions a route is addressed by. Its one live test
 * was commented out beside an empty `it('works', () => {})` (2026-09-13). No engine path calls it
 * today — the IsoMatcher and `resolveViewItem` do the addressing — so what is pinned here is the
 * shape it returns for the plane forms a host could hand it, not an invented contract for the
 * protocol forms nothing produces.
 */
describe('pluridLinkPathDivider', () => {
    it('a plain link is a PLANE division, and the divisions it does not use are empty', () => {
        const divided = pluridLinkPathDivider('/plane-one');

        expect(divided.plane.value).toBe('plane-one');
        expect(divided.plane.parameters).toStrictEqual({});
        expect(divided.plane.query).toStrictEqual({});
        expect(divided.valid).toBe(true);

        for (const division of [divided.path, divided.space, divided.universe, divided.cluster]) {
            expect(division.value).toBe('');
        }
    });

    it('a nested path stays one plane division', () => {
        expect(pluridLinkPathDivider('/a/b').plane.value).toBe('a/b');
    });

    it('the query and the fragment travel WITH the plane\'s value, undivided', () => {
        const divided = pluridLinkPathDivider('/a?x=1#:~:text=z');
        expect(divided.plane.value).toBe('a?x=1#:~:text=z');
        // the divider does not read them: `resolveViewItem` and the IsoMatcher do
        expect(divided.plane.query).toStrictEqual({});
        expect(divided.plane.fragments).toStrictEqual({ texts: [], elements: [] });
    });
});
// #endregion module
