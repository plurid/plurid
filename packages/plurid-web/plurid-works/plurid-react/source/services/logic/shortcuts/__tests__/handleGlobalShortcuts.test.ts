// #region imports
    // #region libraries
    import {
        TRANSFORM_MODES,
        PLURID_ATTRIBUTE_PLANE_ANCHOR,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '../../../state/actions';
    // #endregion external


    // #region internal
    import {
        handleGlobalShortcuts,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * The keyboard ladder is now a data-driven binding table the config can disable / remap / extend
 * (Tier 3d). These tests pin BOTH that the default bindings still dispatch the right action (the
 * refactor preserved behavior) AND the new disable/remap/onUnhandledKey plumbing — the same matrix
 * verified live in the render-test harness.
 */
type EventOverrides = Partial<{
    code: string;
    key: string;
    shiftKey: boolean;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    composedPath: () => any[];
    target: any;
}>;

/** a key from inside a plane's content: the target is under a `[data-plurid-plane]` */
const insideContent = { id: '', hasAttribute: () => false, getAttribute: () => null, closest: (selector: string) => (selector === '[data-plurid-plane]' ? {} : null) };
/** a key from a plane's focus anchor: the anchor names its plane in an attribute (the DOM id is a digest) */
const focusAnchorOf = (planeID: string) => ({
    id: 'plurid-digest-focus',
    hasAttribute: (name: string) => name === PLURID_ATTRIBUTE_PLANE_ANCHOR,
    getAttribute: (name: string) => (name === PLURID_ATTRIBUTE_PLANE_ANCHOR ? planeID : null),
    closest: () => null,
});

const makeEvent = (over: EventOverrides = {}): KeyboardEvent => {
    const ev: any = {
        code: '',
        key: '',
        shiftKey: false,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        defaultPrevented: false,
        composedPath: () => [],
        ...over,
    };
    ev.preventDefault = () => { ev.defaultPrevented = true; };
    return ev as KeyboardEvent;
}

const makeState = (spaceOver: Record<string, any> = {}): any => ({
    space: {
        selectedPlaneIDs: [],
        activePlaneID: '/a',
        isolatePlane: '',
        tree: [],
        ...spaceOver,
    },
});

const allUnlocked: any = {
    rotationX: true,
    rotationY: true,
    translationX: true,
    translationY: true,
    translationZ: true,
    scale: true,
};

/** Runs the handler against fresh recorders and returns what it dispatched / published / preventDefaulted. */
const run = (
    event: KeyboardEvent,
    {
        state = makeState(),
        firstPerson = false,
        shortcuts = undefined as any,
    } = {},
) => {
    const dispatched: any[] = [];
    const published: any[] = [];
    const dispatch: any = (action: any) => { dispatched.push(action); return action; };
    const pubsub: any = { publish: (message: any) => { published.push(message); } };

    handleGlobalShortcuts(dispatch, state, pubsub, event, firstPerson, allUnlocked, shortcuts);

    return {
        types: dispatched.map((a) => a.type),
        dispatched,
        published,
        prevented: (event as any).defaultPrevented as boolean,
    };
}


describe('the mode keys', () => {
    it('R inside a plane\'s content is the page\'s: nothing runs, nothing is prevented', () => {
        for (const code of ['KeyR', 'KeyT', 'KeyS', 'KeyF', 'Digit0']) {
            const result = run(makeEvent({ code, target: insideContent }));
            expect({ code, types: result.types, prevented: result.prevented }).toEqual({ code, types: [], prevented: false });
        }
        // and the selection keys the same
        for (const code of ['KeyA', 'KeyI']) {
            const result = run(makeEvent({ code, metaKey: true, target: insideContent }));
            expect({ code, types: result.types }).toEqual({ code, types: [] });
        }
    });

    it('a mode key toggles: R in rotation mode leaves it', () => {
        const rotating = makeState();
        rotating.configuration = { space: { transformMode: TRANSFORM_MODES.ROTATION } };
        const result = run(makeEvent({ code: 'KeyR' }), { state: rotating });
        expect(result.dispatched).toEqual([actions.configuration.setConfigurationSpaceTransformMode(TRANSFORM_MODES.ALL)]);
        const scaling = makeState();
        scaling.configuration = { space: { transformMode: TRANSFORM_MODES.ROTATION } };
        expect(run(makeEvent({ code: 'KeyS' }), { state: scaling }).dispatched)
            .toEqual([actions.configuration.setConfigurationSpaceTransformMode(TRANSFORM_MODES.SCALE)]);
    });

    it('Escape leaves a transform mode, and is the selection\'s only when no mode is on', () => {
        const rotating = makeState({ selectedPlaneIDs: ['/a'] });
        rotating.configuration = { space: { transformMode: TRANSFORM_MODES.ROTATION } };
        const result = run(makeEvent({ code: 'Escape' }), { state: rotating });
        expect(result.dispatched).toEqual([actions.configuration.setConfigurationSpaceTransformMode(TRANSFORM_MODES.ALL)]);
        expect(result.prevented).toBe(true);
    });

    it('Enter on a plane\'s focus anchor frames THAT plane, not the active one', () => {
        const state = makeState({
            activePlaneID: 'plane-a',
            tree: [
                { planeID: 'plane-a', route: '/a', location: { translateX: 0, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 }, children: [] },
                { planeID: 'plane-b', route: '/b', location: { translateX: 500, translateY: 0, translateZ: 0, rotateX: 0, rotateY: 0 }, children: [] },
            ],
        });
        // from plane b's anchor: one navigation (a thunk), for b
        const fromB = run(makeEvent({ code: 'Enter', target: focusAnchorOf('plane-b') }), { state });
        expect(fromB.prevented).toBe(true);
        expect(fromB.dispatched).toHaveLength(1);
        expect(typeof fromB.dispatched[0]).toBe('function');
        // from the anchor of a plane that is not there: nothing, though the ACTIVE plane could have been framed
        const fromNowhere = run(makeEvent({ code: 'Enter', target: focusAnchorOf('plane-gone') }), { state });
        expect(fromNowhere.dispatched).toHaveLength(0);
        // from the view itself: the active plane
        const fromView = run(makeEvent({ code: 'Enter' }), { state });
        expect(fromView.dispatched).toHaveLength(1);
    });
});


describe('handleGlobalShortcuts — default bindings (regression)', () => {
    it('KeyR (no modifiers) switches to ROTATION mode', () => {
        const r = run(makeEvent({ code: 'KeyR', key: 'r' }));
        expect(r.types).toContain(actions.configuration.setConfigurationSpaceTransformMode(TRANSFORM_MODES.ROTATION).type);
        expect(r.dispatched[0].payload).toBe(TRANSFORM_MODES.ROTATION);
        expect(r.prevented).toBe(true);
    });

    it('KeyT / KeyS switch to TRANSLATION / SCALE', () => {
        expect(run(makeEvent({ code: 'KeyT', key: 't' })).dispatched[0].payload).toBe(TRANSFORM_MODES.TRANSLATION);
        expect(run(makeEvent({ code: 'KeyS', key: 's' })).dispatched[0].payload).toBe(TRANSFORM_MODES.SCALE);
    });

    it('Cmd/Ctrl+Z = undo, +Shift = redo', () => {
        expect(run(makeEvent({ code: 'KeyZ', metaKey: true })).types).toContain(actions.space.undo().type);
        expect(run(makeEvent({ code: 'KeyZ', metaKey: true, shiftKey: true })).types).toContain(actions.space.redo().type);
    });

    it('Home / 0 fit to view (an animated thunk through the camera core)', () => {
        const digit = run(makeEvent({ code: 'Digit0', key: '0' }));
        expect(digit.dispatched).toHaveLength(1);
        expect(typeof digit.dispatched[0]).toBe('function');
        expect(digit.prevented).toBe(true);
        const home = run(makeEvent({ code: 'Home', key: 'Home' }));
        expect(typeof home.dispatched[0]).toBe('function');
    });

    it('Escape clears the selection only when something is selected', () => {
        const withSelection = run(makeEvent({ code: 'Escape', key: 'Escape' }), { state: makeState({ selectedPlaneIDs: ['/a'] }) });
        expect(withSelection.types).toContain(actions.space.clearSelection().type);

        const empty = run(makeEvent({ code: 'Escape', key: 'Escape' }));
        expect(empty.types).toEqual([]); // falls through (reaches onUnhandledKey if a host wired one)
    });

    it('a plain unbound key dispatches nothing', () => {
        expect(run(makeEvent({ code: 'KeyM', key: 'm' })).types).toEqual([]);
    });

    it('keys typed into an <input> are ignored (the inputOnPath guard)', () => {
        const r = run(makeEvent({ code: 'KeyR', key: 'r', composedPath: () => [{ tagName: 'INPUT' }] }));
        expect(r.types).toEqual([]);
        expect(r.prevented).toBe(false);
    });
});


describe('handleGlobalShortcuts — config control (Tier 3d)', () => {
    it('disabled:true releases the whole keyboard to onUnhandledKey', () => {
        const unhandled: string[] = [];
        const shortcuts = { disabled: true, onUnhandledKey: (e: any) => unhandled.push(e.code) };

        const r = run(makeEvent({ code: 'KeyR', key: 'r' }), { shortcuts });
        expect(r.types).toEqual([]);
        expect(unhandled).toEqual(['KeyR']);
    });

    it('disabled:[id] drops only that shortcut; the rest still fire', () => {
        const unhandled: string[] = [];
        const shortcuts = { disabled: ['modeRotation'], onUnhandledKey: (e: any) => unhandled.push(e.code) };

        expect(run(makeEvent({ code: 'KeyR', key: 'r' }), { shortcuts }).types).toEqual([]);
        expect(unhandled).toEqual(['KeyR']);
        expect(run(makeEvent({ code: 'KeyT', key: 't' }), { shortcuts }).dispatched[0].payload).toBe(TRANSFORM_MODES.TRANSLATION);
    });

    it('keymap remaps a shortcut to a new code; the old code falls through', () => {
        const unhandled: string[] = [];
        const shortcuts = { keymap: { modeRotation: 'KeyP' }, onUnhandledKey: (e: any) => unhandled.push(e.code) };

        expect(run(makeEvent({ code: 'KeyP', key: 'p' }), { shortcuts }).dispatched[0].payload).toBe(TRANSFORM_MODES.ROTATION);
        expect(run(makeEvent({ code: 'KeyR', key: 'r' }), { shortcuts }).types).toEqual([]);
        expect(unhandled).toEqual(['KeyR']);
    });

    it('onUnhandledKey is NOT fired for keys typed into an input', () => {
        const unhandled: string[] = [];
        const shortcuts = { onUnhandledKey: (e: any) => unhandled.push(e.code) };
        run(makeEvent({ code: 'KeyM', key: 'm', composedPath: () => [{ tagName: 'INPUT' }] }), { shortcuts });
        expect(unhandled).toEqual([]);
    });
});
// #endregion module
