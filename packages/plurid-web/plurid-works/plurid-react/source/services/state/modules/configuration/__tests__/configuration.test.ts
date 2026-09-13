// #region imports
    // #region libraries
    import {
        SIZES,
        TRANSFORM_MODES,
        TOOLBAR_DRAWERS,
        LAYOUT_TYPES,
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import {
        reducer,
        actions,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * THE LIVE CONFIGURATION: what a host passed, plus every change the reader has made to it since.
 *
 * Untested until 2026-09-13, although it is a reducer of ~25 cases where three of them do something
 * a reader of the name would not expect: `setConfiguration` REPLACES rather than merges; a transform
 * mode set to the mode it already holds falls back to ALL (the toolbar's buttons are latches, not
 * radio buttons); and a transform lock is a TOGGLE, not a set. Each is a deliberate contract and
 * each is one character from being silently broken.
 */
const start = () => reducer(undefined, { type: '@@init' });

const after = (
    ...dispatched: { type: string; payload?: unknown }[]
) => dispatched.reduce((state, action) => reducer(state, action as never), start());


describe('the live configuration', () => {
    it('starts as the defaults', () => {
        expect(start()).toEqual(defaultConfiguration);
    });

    it('`setConfiguration` REPLACES the whole thing — a host\'s new configuration is the only one', () => {
        const changed = after(actions.setConfigurationPlaneOpacity(0.4));
        expect(changed.elements.plane.opacity).toBe(0.4);

        const replaced = reducer(changed, actions.setConfiguration({
            ...defaultConfiguration,
            global: { ...defaultConfiguration.global, language: 'ukrainian' },
        } as never));

        // the reader's opacity is gone with everything else: this is a replacement, not a merge
        expect(replaced.elements.plane.opacity).toBe(defaultConfiguration.elements.plane.opacity);
        expect(replaced.global.language).toBe('ukrainian');
    });

    it('the two halves of the theme are set independently, and neither loses the other', () => {
        const general = after(actions.setConfigurationThemeGeneral('plurid-dark'));
        expect(general.global.theme).toEqual({ general: 'plurid-dark', interaction: 'plurid' });

        const both = reducer(general, actions.setConfigurationThemeInteraction('plurid-light'));
        expect(both.global.theme).toEqual({ general: 'plurid-dark', interaction: 'plurid-light' });

        // and setting the general one again keeps the interaction one that was chosen
        const again = reducer(both, actions.setConfigurationThemeGeneral('plurid'));
        expect(again.global.theme).toEqual({ general: 'plurid', interaction: 'plurid-light' });
    });

    it('the chrome\'s flags each move one field, and the toggles flip only their own', () => {
        const state = after(
            actions.toggleConfigurationViewcubeHide(false),
            actions.toggleConfigurationViewcubeButtons(false),
            actions.toggleConfigurationViewcubeOpaque(true),
            actions.toggleConfigurationViewcubeConceal(),
            actions.setConfigurationPlaneControls(false),
            actions.setConfigurationSpaceTransformOriginSize(SIZES.LARGE),
        );

        expect(state.elements.viewcube.show).toBe(false);
        expect(state.elements.viewcube.buttons).toBe(false);
        expect(state.elements.viewcube.opaque).toBe(true);
        expect(state.elements.viewcube.conceal).toBe(!defaultConfiguration.elements.viewcube.conceal);
        expect(state.elements.plane.controls.show).toBe(false);
        expect(state.space.transformOrigin.size).toBe(SIZES.LARGE);

        // the conceal toggles back, and takes nothing with it
        const back = reducer(state, actions.toggleConfigurationViewcubeConceal());
        expect(back.elements.viewcube.conceal).toBe(defaultConfiguration.elements.viewcube.conceal);
        expect(back.elements.viewcube.opaque).toBe(true);
    });

    it('THE TRANSFORM MODE IS A LATCH: picking the mode already held goes back to ALL', () => {
        const rotation = after(actions.setConfigurationSpaceTransformMode(TRANSFORM_MODES.ROTATION));
        expect(rotation.space.transformMode).toBe(TRANSFORM_MODES.ROTATION);

        // the toolbar's buttons are latches — pressing the lit one lets go of it
        const released = reducer(rotation, actions.setConfigurationSpaceTransformMode(TRANSFORM_MODES.ROTATION));
        expect(released.space.transformMode).toBe(TRANSFORM_MODES.ALL);

        // a different one simply takes over
        const scale = reducer(rotation, actions.setConfigurationSpaceTransformMode(TRANSFORM_MODES.SCALE));
        expect(scale.space.transformMode).toBe(TRANSFORM_MODES.SCALE);
    });

    it('A TRANSFORM LOCK IS A TOGGLE, and locking one axis leaves the others exactly as they were', () => {
        const locked = after(actions.setConfigurationSpaceTransformLocks('rotationX' as never));
        const before = defaultConfiguration.space.transformLocks as unknown as Record<string, boolean>;
        const now = locked.space.transformLocks as unknown as Record<string, boolean>;

        expect(now.rotationX).toBe(!before.rotationX);
        for (const [key, value] of Object.entries(before)) {
            if (key !== 'rotationX') {
                expect({ key, value: now[key] }).toEqual({ key, value });
            }
        }

        const unlocked = reducer(locked, actions.setConfigurationSpaceTransformLocks('rotationX' as never));
        expect((unlocked.space.transformLocks as unknown as Record<string, boolean>).rotationX).toBe(before.rotationX);
    });

    it('a toolbar drawer opens, closes, and shares the list with the drawers already open', () => {
        const one = after(actions.toggleConfigurationToolbarToggleDrawer(TOOLBAR_DRAWERS.SPACE));
        expect(one.elements.toolbar.toggledDrawers).toContain(TOOLBAR_DRAWERS.SPACE);

        const two = reducer(one, actions.toggleConfigurationToolbarToggleDrawer(TOOLBAR_DRAWERS.VIEWCUBE));
        expect(two.elements.toolbar.toggledDrawers).toEqual(
            expect.arrayContaining([TOOLBAR_DRAWERS.SPACE, TOOLBAR_DRAWERS.VIEWCUBE]),
        );

        // closing one leaves the other open
        const closed = reducer(two, actions.toggleConfigurationToolbarToggleDrawer(TOOLBAR_DRAWERS.SPACE));
        expect(closed.elements.toolbar.toggledDrawers).toEqual([TOOLBAR_DRAWERS.VIEWCUBE]);
    });

    it('the layout is named by its TYPE, and the culling distance keeps the rest of the culling', () => {
        const rows = after(actions.setConfigurationSpaceLayout('ROWS' as never));
        expect(rows.space.layout).toEqual({ type: LAYOUT_TYPES.ROWS });

        const culled = after(actions.setConfigurationSpaceCullingDistance(4200));
        expect(culled.space.culling?.distance).toBe(4200);
        for (const [key, value] of Object.entries(defaultConfiguration.space.culling ?? {})) {
            if (key !== 'distance') {
                expect({ key, value: (culled.space.culling as Record<string, unknown>)[key] }).toEqual({ key, value });
            }
        }
    });

    it('the minimap\'s flags are guarded: a configuration with no minimap is not a crash', () => {
        const shown = after(
            actions.toggleConfigurationMinimapHide(false),
            actions.toggleConfigurationMinimapTransparent(true),
        );
        expect(shown.elements.minimap?.show).toBe(false);
        expect(shown.elements.minimap?.transparent).toBe(true);

        const without = reducer(
            { ...start(), elements: { ...start().elements, minimap: undefined } } as never,
            actions.toggleConfigurationMinimapHide(true),
        );
        expect(without.elements.minimap).toBeUndefined();
    });

    it('the language is the host\'s to change at runtime', () => {
        for (const language of ['english', 'ukrainian', 'arabic', 'norwegian', 'japanese'] as const) {
            expect(after(actions.setConfigurationLanguage(language)).global.language).toBe(language);
        }
    });
});
// #endregion module
