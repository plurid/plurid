// #region imports
    // #region internal
    import {
        reducer,
        actions,
        selectors,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * THE CHROME'S STATE. Five booleans and a rect — small enough that it had no test (2026-09-13), and
 * central enough that every piece of chrome reads it: the rail, the palette, the help overlay, the
 * marquee, and the cursor over the whole space.
 *
 * The one thing here that is not obvious is GRAB, which is TWO flags: `grabMode` is the toggle G
 * sets and `grabHold` is Space held down, and what the space actually does is the OR of them. That
 * split is the reason a reader can hold Space for one orbit inside an armed grab and get their
 * pointer back on release — and the reason a single flag would break both halves of it.
 */
const start = () => reducer(undefined, { type: '@@init' });

const after = (
    ...dispatched: { type: string; payload?: unknown }[]
) => dispatched.reduce((state, action) => reducer(state, action as never), start());

/** The selectors read `AppState`; the module is a slice of it. */
const app = (
    ui: ReturnType<typeof start>,
) => ({ ui } as never);


describe('the chrome\'s state', () => {
    it('starts with nothing open, nothing grabbed, and no marquee', () => {
        const state = start();

        expect(state).toEqual({
            toolbarScrollPosition: 0,
            grabMode: false,
            grabHold: false,
            shortcutsOverlayVisible: false,
            paletteVisible: false,
            marquee: null,
        });
    });

    it('every flag is its OWN: opening one piece of chrome moves nothing else', () => {
        const state = after(
            actions.setPaletteVisible(true),
            actions.setShortcutsOverlayVisible(true),
            actions.setUIToolbarScrollPosition(240),
            actions.setMarquee({ left: 10, top: 20, right: 110, bottom: 80 }),
        );

        expect(state.paletteVisible).toBe(true);
        expect(state.shortcutsOverlayVisible).toBe(true);
        expect(state.toolbarScrollPosition).toBe(240);
        expect(state.marquee).toEqual({ left: 10, top: 20, right: 110, bottom: 80 });
        // and the grab, which nothing here touches
        expect(state.grabMode).toBe(false);
        expect(state.grabHold).toBe(false);
    });

    it('the toggles flip what the setters set, and the marquee clears to null', () => {
        const opened = after(actions.togglePalette(), actions.toggleShortcutsOverlay());
        expect({ palette: opened.paletteVisible, help: opened.shortcutsOverlayVisible })
            .toEqual({ palette: true, help: true });

        const closed = reducer(reducer(opened, actions.togglePalette()), actions.toggleShortcutsOverlay());
        expect({ palette: closed.paletteVisible, help: closed.shortcutsOverlayVisible })
            .toEqual({ palette: false, help: false });

        const cleared = reducer(
            after(actions.setMarquee({ left: 0, top: 0, right: 1, bottom: 1 })),
            actions.setMarquee(null),
        );
        expect(cleared.marquee).toBeNull();
    });
});


describe('grab is a toggle AND a hold', () => {
    it('EITHER ONE grabs: G alone, Space alone, or both at once', () => {
        const none = start();
        expect(selectors.getGrabMode(app(none))).toBe(false);

        const toggled = after(actions.toggleUIGrabMode());
        expect(selectors.getGrabMode(app(toggled))).toBe(true);

        const held = after(actions.setUIGrabHold(true));
        expect(selectors.getGrabMode(app(held))).toBe(true);

        const both = after(actions.toggleUIGrabMode(), actions.setUIGrabHold(true));
        expect(selectors.getGrabMode(app(both))).toBe(true);
    });

    it('RELEASING SPACE INSIDE AN ARMED GRAB KEEPS THE GRAB: the hold is not the toggle', () => {
        const armed = after(actions.toggleUIGrabMode());
        const holding = reducer(armed, actions.setUIGrabHold(true));
        const released = reducer(holding, actions.setUIGrabHold(false));

        expect(selectors.getGrabMode(app(released))).toBe(true);
        // and the other way: a hold that ends when nothing was armed gives the pointer back
        const onlyHeld = reducer(after(actions.setUIGrabHold(true)), actions.setUIGrabHold(false));
        expect(selectors.getGrabMode(app(onlyHeld))).toBe(false);
    });

    it('`getGrabToggled` is the ARMED half alone — what the rail\'s button lights up', () => {
        const held = after(actions.setUIGrabHold(true));
        expect(selectors.getGrabMode(app(held))).toBe(true);
        expect(selectors.getGrabToggled(app(held))).toBe(false);

        const armed = after(actions.toggleUIGrabMode());
        expect(selectors.getGrabToggled(app(armed))).toBe(true);
    });

    it('A HOLD THAT DOES NOT CHANGE ANYTHING IS NOT A CHANGE: the state keeps its identity', () => {
        // the pointer handlers set this on every key event; a new object each time would re-render
        // every subscriber of the chrome for nothing
        const held = after(actions.setUIGrabHold(true));
        expect(reducer(held, actions.setUIGrabHold(true))).toBe(held);

        const idle = start();
        expect(reducer(idle, actions.setUIGrabHold(false))).toBe(idle);

        // a real change is a new state, as every reducer's is
        expect(reducer(idle, actions.setUIGrabHold(true))).not.toBe(idle);
    });

    it('`setUIGrabMode(false)` disarms without touching a live hold', () => {
        const both = after(actions.toggleUIGrabMode(), actions.setUIGrabHold(true));
        const disarmed = reducer(both, actions.setUIGrabMode(false));

        expect(disarmed.grabMode).toBe(false);
        expect(disarmed.grabHold).toBe(true);
        // Space is still down, so the space is still grabbed
        expect(selectors.getGrabMode(app(disarmed))).toBe(true);
    });
});
// #endregion module
