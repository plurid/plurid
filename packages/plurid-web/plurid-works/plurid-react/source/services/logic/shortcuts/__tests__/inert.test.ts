// #region imports
    // #region libraries
    import {
        PLURID_SHORTCUTS,
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        handleGlobalShortcuts,
        runShortcut,
    } from '../index';

    import {
        readSlot,
        writeSlot,
    } from '~services/logic/clipboard';

    import {
        makeSpaceStore,
    } from '../../../../testing/store';
    import {
        treePlane,
    } from '../../../../testing/fixtures';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE KEYS THAT MUST DO NOTHING ON KEYDOWN.
 *
 * ⌘/Ctrl+C, X and V belong to the BROWSER: pressing one fires a `copy` / `cut` / `paste` event
 * carrying a `DataTransfer`, which is the only way a page reaches the system clipboard without a
 * permission prompt — and the engine listens for those events (`useClipboard`). If the keydown
 * dispatcher ever bound these keys, one of two things would break: preventing the default would
 * CANCEL the clipboard event (nothing would ever reach the clipboard), and not preventing it would
 * run every command TWICE. The bindings therefore exist with `match: () => false` — reachable by
 * name, unreachable by key — and this file is what keeps them that way (2026-09-13).
 */
const clipboardKeys = ['copy', 'cut', 'paste'] as const;

// `treePlane` prepends the separator: 'a' is the plane at `/a`
const store = () => makeSpaceStore(defaultConfiguration, [treePlane('a'), treePlane('b')]);

const press = (
    code: string,
): KeyboardEvent => {
    const prevented: boolean[] = [];
    return {
        code,
        key: code.replace('Key', '').toLowerCase(),
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        target: null,
        preventDefault: () => { prevented.push(true); },
        stopPropagation: () => {},
        __prevented: prevented,
    } as unknown as KeyboardEvent;
};


describe('the clipboard keys are the browser\'s', () => {
    it('the table DOCUMENTS them, so the help and the palette can show the keys', () => {
        for (const id of clipboardKeys) {
            const row = PLURID_SHORTCUTS.find((shortcut) => shortcut.id === id);
            expect({ id, found: !!row }).toEqual({ id, found: true });
            expect({ id, modifier: !!row?.modifiers?.ctrlOrMeta }).toEqual({ id, modifier: true });
        }
    });

    it('a ⌘C / ⌘X / ⌘V KEYDOWN DOES NOTHING AT ALL: no copy, no close, no prevented default', () => {
        for (const code of ['KeyC', 'KeyX', 'KeyV']) {
            writeSlot(null);
            const { dispatch, getState, dispatched } = store();
            const id = getState().space.tree[0].planeID;
            dispatch({ type: 'space/setSelection', payload: [id] });
            const before = dispatched.length;

            const event = press(code);
            handleGlobalShortcuts(
                dispatch,
                getState(),
                { publish: () => {}, subscribe: () => 0, unsubscribe: () => true } as never,
                event,
                false,
                {} as never,
            );

            // THE EFFECT, not the dispatch count: a copy writes the slot and dispatches nothing, so
            // counting dispatches alone would let a matching binding through unnoticed. Nothing was
            // copied, nothing was closed…
            expect({ code, copied: readSlot() }).toEqual({ code, copied: null });
            expect({ code, open: getState().space.tree.find((plane) => plane.planeID === id)?.show })
                .toEqual({ code, open: true });
            expect({ code, dispatches: dispatched.length - before }).toEqual({ code, dispatches: 0 });

            // …and — the part that matters most — the key's default was left alone, so the browser's
            // own clipboard event still fires and still carries a `DataTransfer`
            expect({ code, prevented: (event as unknown as { __prevented: boolean[] }).__prevented.length })
                .toEqual({ code, prevented: 0 });
        }
    });

    it('BY NAME they still run: the palette and a host reach the same one implementation', () => {
        writeSlot(null);
        const { dispatch, getState } = store();
        dispatch({ type: 'space/setSelection', payload: [getState().space.tree[0].planeID] });

        const ran = runShortcut('copy', {
            dispatch,
            state: getState(),
            pubsub: { publish: () => {}, subscribe: () => 0, unsubscribe: () => true } as never,
        } as never);

        // a copy dispatches nothing — it writes the clipboard, and the slot is where that always lands
        expect(ran).toBe(true);
        expect(readSlot()).toContain('plurid/arrangement');
        expect(readSlot()).toContain('"path":"/a"');
    });

    it('a CUT runs by name too, and closes what it copied', () => {
        writeSlot(null);
        const { dispatch, getState } = store();
        const id = getState().space.tree[0].planeID;
        dispatch({ type: 'space/setSelection', payload: [id] });

        runShortcut('cut', {
            dispatch,
            state: getState(),
            pubsub: { publish: () => {}, subscribe: () => 0, unsubscribe: () => true } as never,
        } as never);

        expect(readSlot()).toContain('plurid/arrangement');
        expect(getState().space.tree.find((plane) => plane.planeID === id)?.show).toBe(false);
    });
});
// #endregion module
