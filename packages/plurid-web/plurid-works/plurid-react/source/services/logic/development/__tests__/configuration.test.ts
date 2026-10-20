// #region imports
    // #region external
    import {
        validateApplicationInput,
    } from '../configuration';
    // #endregion external
// #endregion imports



// #region module
/**
 * A FLAT KEY PASSED NESTED is named as one, with the way to write it (2026-10-20). The list of flat
 * keys was kept by hand and eight had gone missing, so `configuration={{ planeBridge: false }}` was
 * "not a key of the configuration" at all; the compiler holds the list to the flat type now.
 */
describe('the configuration a host passes', () => {
    it('names every flat key it is given nested as one of the flat configuration', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const flat = [
                'planeControls', 'dockRail', 'origin', 'planeBridge', 'linkDraggable', 'shortcutsTrigger',
                'palette', 'marquee', 'look', 'chrome', 'planeWidth', 'extend',
            ];
            validateApplicationInput({ configuration: Object.fromEntries(flat.map((key) => [key, true])) }, true);
            const said = warn.mock.calls.map(([message]) => String(message));
            for (const key of flat) {
                expect([key, said.some((message) => message.includes(`\`configuration.${key}\` is a key of the FLAT configuration`))]).toEqual([key, true]);
            }

            validateApplicationInput({ configuration: { planes: [] } }, true);
            expect(warn.mock.calls.at(-1)?.[0]).toContain('`configuration.planes` is not a key of the configuration');
        } finally {
            warn.mockRestore();
        }
    });
});
// #endregion module
