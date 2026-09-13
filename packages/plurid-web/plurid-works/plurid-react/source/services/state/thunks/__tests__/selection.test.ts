// #region imports
    // #region libraries
    import {
        TreePlane,
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';

    import {
        readSlot,
        writeSlot,
    } from '~services/logic/clipboard';

    import {
        resetWarnings,
    } from '~services/logic/development/warn';

    import {
        treePlane,
        configurationWith,
    } from '../../../../testing/fixtures';
    import {
        makeSpaceStore,
    } from '../../../../testing/store';
    // #endregion external


    // #region internal
    import {
        copySelection,
        pasteFragment,
        selectionFragmentText,
    } from '../selection';
    // #endregion internal
// #endregion imports



// #region module
/**
 * THE PASTE, AS A THUNK. `materializeFragment` is tested as a function and the clipboard EVENTS are
 * tested through a mounted application; between the two sits this thunk, which had no test of its
 * own (2026-09-13) — and which owns three things neither of the others can see: what it does when
 * the application cannot make planes at all, WHERE a paste lands so it never hides under its own
 * original, and the one report a host gets about what could not be held.
 *
 * That report is the part that matters most. A paste from another space silently loses every route
 * this one does not register; `onDropped` is the only place those names are ever spoken, and until
 * now nothing asserted that it speaks them.
 */
// `treePlane` prepends the separator: 'a' is the plane whose route — and so whose PATH — is `/a`
const planes = () => [
    treePlane('a', { location: { translateX: 0, translateY: 0 } }),
    treePlane('b', { location: { translateX: 600, translateY: 0 } }),
];

/** An application that makes a plane for every route it registers, as `resolveViewItem` does. */
const registrar = (
    known: string[],
) => {
    let made = 0;
    return (path: string): TreePlane | undefined => {
        if (!known.includes(path)) {
            return undefined;
        }
        made += 1;
        return treePlane(path.slice(1), { planeID: path + '@' + made });
    };
};

/** A space, its clipboard emptied, with the routes this application registers. */
const store = (
    known: string[] = ['/a', '/b'],
    configuration = defaultConfiguration,
) => {
    writeSlot(null);
    const made = makeSpaceStore(configuration, planes());
    made.extra.resolvePlane = registrar(known);
    return made;
};

const shown = (
    state: { space: { tree: TreePlane[] } },
) => state.space.tree.filter((plane) => plane.show !== false);


describe('copying the selection', () => {
    it('writes the selection as a fragment; no selection writes nothing at all', () => {
        const { dispatch, getState } = store();

        dispatch(copySelection() as never);
        expect(readSlot()).toBeNull();

        dispatch(actions.space.setSelection([getState().space.tree[0].planeID]));
        dispatch(copySelection() as never);
        expect(readSlot()).toContain('"path":"/a"');
        expect(selectionFragmentText(getState())).toBe(readSlot());
    });

    it('a CUT is one history entry: everything it copied closes, and one undo brings it all back', () => {
        const { dispatch, getState } = store();
        dispatch(actions.space.setSelection(getState().space.tree.map((plane) => plane.planeID)));

        dispatch(copySelection({ cut: true }) as never);
        expect(shown(getState())).toHaveLength(0);
        expect(getState().space.selectedPlaneIDs).toEqual([]);
        expect(getState().space.history.undoDepth).toBe(1);

        dispatch(actions.space.undo());
        expect(shown(getState())).toHaveLength(2);
    });
});


describe('pasting a fragment', () => {
    /** A dropped paste warns: the suite captures it rather than printing it through every run. */
    let warned: string[] = [];
    let warn: jest.SpyInstance;

    beforeEach(() => {
        resetWarnings();
        warned = [];
        warn = jest.spyOn(console, 'warn').mockImplementation((...parts: unknown[]) => {
            warned.push(parts.join(' '));
        });
    });

    afterEach(() => {
        warn.mockRestore();
        resetWarnings();
    });

    const copied = () => {
        const source = store();
        source.dispatch(actions.space.setSelection(source.getState().space.tree.map((plane) => plane.planeID)));
        source.dispatch(copySelection() as never);
        return readSlot()!;
    };

    it('WHAT COULD NOT BE HELD IS NAMED: `onDropped` speaks every unregistered route, once', () => {
        const text = copied();

        // an application that registers neither
        const none = store([]);
        const nothing: string[][] = [];
        none.dispatch(pasteFragment({ text, onDropped: (routes) => nothing.push(routes) }) as never);
        expect(nothing).toEqual([['/a', '/b']]);
        expect(shown(none.getState())).toHaveLength(2);

        // an application that registers one of the two
        const half = store(['/a']);
        const dropped: string[][] = [];
        half.dispatch(pasteFragment({ text, onDropped: (routes) => dropped.push(routes) }) as never);
        expect(dropped).toEqual([['/b']]);
        expect(shown(half.getState())).toHaveLength(3);

        // and an application that holds everything says nothing
        const whole = store();
        const silent: string[][] = [];
        whole.dispatch(pasteFragment({ text, onDropped: (routes) => silent.push(routes) }) as never);
        expect(silent).toEqual([]);
    });

    it('THE WARNING IS THE THUNK\'S, so every paste path says it — and the host can mute it', () => {
        const text = copied();

        store(['/a']).dispatch(pasteFragment({ text }) as never);
        expect(warned.join('\n')).toContain('/b');
        expect(warned.join('\n')).toContain('does not register');

        // once per page, however many pastes drop something
        store(['/a']).dispatch(pasteFragment({ text }) as never);
        expect(warned).toHaveLength(1);

        resetWarnings();
        warned.length = 0;
        const quiet = store(['/a'], configurationWith({ development: { warnings: false } }));
        quiet.dispatch(pasteFragment({ text }) as never);
        expect(warned).toEqual([]);
    });

    it('NO APPLICATION, NO PASTE: without a resolver nothing lands, and nothing is reported either', () => {
        const text = copied();
        const headless = store();
        headless.extra.resolvePlane = undefined;

        const dropped: string[][] = [];
        headless.dispatch(pasteFragment({ text, onDropped: (routes) => dropped.push(routes) }) as never);

        // the tree is untouched — a paste that cannot be made is not a paste that drops everything
        expect(shown(headless.getState())).toHaveLength(2);
        expect(dropped).toEqual([]);
        expect(headless.getState().space.history.canUndo).toBe(false);
    });

    it('text that is not a fragment is left to the page: no dispatch, no history, no report', () => {
        const { dispatch, getState } = store();
        const before = JSON.stringify(getState().space);

        for (const text of ['', 'an ordinary paragraph', '{"plurid":"plurid/arrangement"', null]) {
            const dropped: string[][] = [];
            dispatch(pasteFragment({ text, onDropped: (routes) => dropped.push(routes) }) as never);
            expect({ text, reported: dropped }).toEqual({ text, reported: [] });
        }
        expect(JSON.stringify(getState().space)).toBe(before);
    });

    it('WITH NO TEXT it pastes what this document last copied (the slot is the fallback)', () => {
        const { dispatch, getState } = store();
        dispatch(actions.space.setSelection([getState().space.tree[0].planeID]));
        dispatch(copySelection() as never);

        dispatch(pasteFragment() as never);
        expect(shown(getState())).toHaveLength(3);
    });

    it('A PASTE NEVER HIDES UNDER ITS ORIGINAL, and a second paste steps past the first', () => {
        const { dispatch, getState } = store();
        dispatch(actions.space.setSelection([getState().space.tree[0].planeID]));
        dispatch(copySelection() as never);
        const origin = getState().space.tree[0].location.translateX;

        dispatch(pasteFragment() as never);
        const first = shown(getState())[2].location.translateX;
        expect(first).not.toBe(origin);

        dispatch(pasteFragment() as never);
        const second = shown(getState())[3].location.translateX;
        expect(second).not.toBe(first);
        expect(second).not.toBe(origin);

        // each paste is its own history entry, and the new planes are the selection
        expect(getState().space.selectedPlaneIDs).toEqual([shown(getState())[3].planeID]);
        dispatch(actions.space.undo());
        expect(shown(getState())).toHaveLength(3);
    });

    it('a host may hand the FRAGMENT over, with no text and nothing on any clipboard', () => {
        const text = copied();
        const fragment = JSON.parse(text);

        const target = store(['/a']);
        writeSlot(null);
        target.dispatch(pasteFragment({ fragment }) as never);

        expect(shown(target.getState())).toHaveLength(3);
        expect(readSlot()).toBeNull();
    });
});
// #endregion module
