/**
 * THE DRAWERS ARE CHECKED (2026-10-20). An unknown name in `elements.toolbar.drawers` became an
 * `undefined` menu, and opening More threw (a TypeError in a render, with no boundary around the
 * chrome): the known drawers are kept, and the unknown names are said in development.
 */
import {
    resolveMenus,
} from '../index';



describe('the More menu\'s drawers', () => {
    it('keeps the known drawers and names the unknown ones', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        try {
            const menus = resolveMenus(['NOPE', 'GLOBAL'] as any);
            expect(menus).toHaveLength(1);
            expect(menus.every(Boolean)).toBe(true);
            expect(warn.mock.calls.some(([message]) => /NOPE/.test(String(message)))).toBe(true);
        } finally {
            warn.mockRestore();
        }
    });
});
