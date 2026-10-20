// #region imports
    // #region external
    import {
        PLURID_SHORTCUTS,
    } from '../constants/shortcuts/table';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE TABLE READS IN THE DISPATCHER'S ORDER (2026-10-20). For a key several bindings share, the
 * dispatcher (plurid-react, `services/logic/shortcuts`) runs the first whose condition holds, and the
 * generated SHORTCUTS.md says the rows above win; the table listed Escape's `dock` after the two mode
 * exits, though the dispatcher tries it first.
 */
describe('the shortcut table', () => {
    it('lists Escape\'s bindings in the order the dispatcher tries them', () => {
        const escape = PLURID_SHORTCUTS.filter((shortcut) => shortcut.code === 'Escape').map((shortcut) => shortcut.id);
        expect(escape).toEqual(['dock', 'exitGrabMode', 'exitTransformMode', 'clearSelection']);
    });
});
// #endregion module
