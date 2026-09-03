// #region imports
    // #region libraries
    import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';


    import {
        dom,
    } from '@plurid/plurid-functions';

    import {
        TRANSFORM_MODES,

        PluridConfigurationSpaceTransformLocks,
        PluridConfigurationSpaceShortcuts,
        PluridShortcutID,

        PluridPubSub as IPluridPubSub,
        FOCUS_ANCHOR_SUFFIX,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import actions from '~services/state/actions';

    import {
        focusActivePlane,
        focusParentActivePlane,
        focusPreviousRoot,
        focusNextRoot,
        focusRootIndex,
    } from '~services/logic/animation';

    import {
        isEditableTarget,
    } from '~services/logic/input/guard';

    import {
        fitToView,
        frameSelection,
        goHome,
    } from '~services/logic/camera';

    import {
        navigateDirection,
        duplicateSelection,
    } from '~services/state/thunks/selection';


    // #endregion external


    // #region internal
    import {
        refreshActivePlane,
        isolateActivePlane,
        openClosedPlane,
        closeActivePlane,
    } from './logic';
    // #endregion internal
// #endregion imports



// #region module
/** The key came from inside a plane's CONTENT (not the view, not a plane's focus anchor). */
const insidePlaneContent = (
    event: KeyboardEvent,
): boolean => {
    const target = event.target as HTMLElement | null;
    if (!target || typeof target.closest !== 'function') {
        return false;
    }
    if (typeof target.id === 'string' && target.id.endsWith(FOCUS_ANCHOR_SUFFIX)) {
        return false;
    }
    return !!target.closest('[data-plurid-plane]');
};

/**
 * One keyboard shortcut. `match` replicates the original `if`-condition verbatim (so ORDER + the
 * loose modifier checks are preserved exactly); `code` is the default `event.code` a `keymap` entry
 * remaps; `run` performs the action (calling `ctx.prevent()` itself) and returns `false` to fall
 * through to the next binding (used only by the arrow `transformNudge`, which no-ops when no axis is
 * unlocked). The whole table is data so the config can disable / remap by `id` and a help overlay can
 * generate from it.
 */
interface ShortcutContext {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    state: AppState;
    pubsub: IPluridPubSub;
    event: KeyboardEvent;
    firstPerson: boolean;
    locks: PluridConfigurationSpaceTransformLocks;
    noModifiers: boolean;
    prevent: () => void;
}

interface ShortcutBinding {
    id: PluridShortcutID;
    /** Default `event.code` (omitted for the arrow group, whose triggers are fixed). Remappable via `keymap`. */
    code?: string;
    match: (event: KeyboardEvent, code: string | undefined, ctx: ShortcutContext) => boolean;
    run: (ctx: ShortcutContext) => boolean | void;
}


const runTransformNudge = (ctx: ShortcutContext): boolean => {
    const { event: e, locks, dispatch, prevent } = ctx;

    if (e.key === 'ArrowRight') {
        if (e.shiftKey && locks.rotationY) { prevent(); dispatch(actions.space.rotateLeft()); return true; }
        if (e.altKey && locks.translationX) { prevent(); dispatch(actions.space.translateRight()); return true; }
    }
    if (e.key === 'ArrowLeft') {
        if (e.shiftKey && locks.rotationY) { prevent(); dispatch(actions.space.rotateRight()); return true; }
        if (e.altKey && locks.translationX) { prevent(); dispatch(actions.space.translateLeft()); return true; }
    }
    if (e.key === 'ArrowUp') {
        if (e.shiftKey && e.altKey && locks.translationZ) { prevent(); dispatch(actions.space.translateIn()); return true; }
        if (e.shiftKey && !e.altKey && locks.rotationX) { prevent(); dispatch(actions.space.rotateUp()); return true; }
        if (e.altKey && !e.shiftKey && locks.translationY) { prevent(); dispatch(actions.space.translateUp()); return true; }
        if ((e.metaKey || e.ctrlKey) && locks.scale) { prevent(); dispatch(actions.space.scaleUp()); return true; }
    }
    if (e.key === 'ArrowDown') {
        if (e.shiftKey && e.altKey && locks.translationZ) { prevent(); dispatch(actions.space.translateOut()); return true; }
        if (e.shiftKey && !e.altKey && locks.rotationX) { prevent(); dispatch(actions.space.rotateDown()); return true; }
        if (e.altKey && !e.shiftKey && locks.translationY) { prevent(); dispatch(actions.space.translateDown()); return true; }
        if ((e.metaKey || e.ctrlKey) && locks.scale) { prevent(); dispatch(actions.space.scaleDown()); return true; }
    }
    return false;
}


// The binding table — SAME order and SAME (deliberately loose) match conditions as the original
// if-ladder, so first-match-wins behavior is byte-for-byte preserved. Only the surrounding
// disable / remap / unhandled-key plumbing is new.
const SHORTCUTS: ShortcutBinding[] = [
    {
        // Cmd/Ctrl+Z = undo, +Shift = redo. The editable-target guard lets an editor keep its own undo.
        id: 'undo', code: 'KeyZ',
        match: (e, code) => (e.metaKey || e.ctrlKey) && e.code === code,
        run: ({ dispatch, event, prevent }) => {
            prevent();
            dispatch(event.shiftKey ? actions.space.redo() : actions.space.undo());
        },
    },
    {
        // `?` (Shift+/ on most layouts, or the key character itself) toggles the help overlay;
        // Escape closes it while it is open.
        id: 'help', code: 'Slash',
        match: (e, code, ctx) => e.key === '?'
            || (e.shiftKey && e.code === code)
            || (e.code === 'Escape' && !!ctx.state.ui?.shortcutsOverlayVisible),
        run: ({ dispatch, state, event, prevent }) => {
            prevent();
            if (event.code === 'Escape') {
                dispatch(actions.ui.setShortcutsOverlayVisible(false));
            } else {
                dispatch(actions.ui.toggleShortcutsOverlay());
            }
            void state;
        },
    },
    {
        // G toggles grab / navigate mode (left drag orbits everywhere, the wheel zooms).
        id: 'grabMode', code: 'KeyG',
        match: (e, code, ctx) => e.code === code && ctx.noModifiers,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(actions.ui.toggleUIGrabMode()); },
    },
    {
        id: 'exitGrabMode', code: 'Escape',
        match: (e, code, ctx) => e.code === code && !!ctx.state.ui?.grabMode,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(actions.ui.setUIGrabMode(false)); },
    },
    {
        // Escape clears the selection — only when something is selected, so an empty Escape still
        // reaches the host (help overlay, etc.) via `onUnhandledKey`.
        id: 'clearSelection', code: 'Escape',
        match: (e, code, ctx) => e.code === code && ctx.state.space.selectedPlaneIDs.length > 0,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(actions.space.clearSelection()); },
    },
    {
        // Frame all planes (CAD "fit"): 0 — animated, from the measured extents.
        id: 'fitToView', code: 'Digit0',
        match: (e, code, ctx) => e.code === code && ctx.noModifiers,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(fitToView({ animate: true }) as any); },
    },
    {
        // The home viewpoint (`space.setHome` / `navigation.home` / identity): Home.
        id: 'home', code: 'Home',
        match: (e, code, ctx) => (e.code === code || e.key === 'Home') && ctx.noModifiers,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(goHome(true) as any); },
    },
    // Keyboard plane navigation: plain arrows walk to the nearest plane in that screen direction,
    // Enter frames the active plane. Never from inside plane CONTENT (a focused field, list or link
    // keeps its own arrows/Enter) — only from the view itself or a plane's focus anchor.
    {
        id: 'navigateLeft', code: 'ArrowLeft',
        match: (e, code, ctx) => e.code === code && ctx.noModifiers && !insidePlaneContent(e),
        run: ({ dispatch, prevent }) => { prevent(); dispatch(navigateDirection('left') as any); },
    },
    {
        id: 'navigateRight', code: 'ArrowRight',
        match: (e, code, ctx) => e.code === code && ctx.noModifiers && !insidePlaneContent(e),
        run: ({ dispatch, prevent }) => { prevent(); dispatch(navigateDirection('right') as any); },
    },
    {
        id: 'navigateUp', code: 'ArrowUp',
        match: (e, code, ctx) => e.code === code && ctx.noModifiers && !insidePlaneContent(e),
        run: ({ dispatch, prevent }) => { prevent(); dispatch(navigateDirection('up') as any); },
    },
    {
        id: 'navigateDown', code: 'ArrowDown',
        match: (e, code, ctx) => e.code === code && ctx.noModifiers && !insidePlaneContent(e),
        run: ({ dispatch, prevent }) => { prevent(); dispatch(navigateDirection('down') as any); },
    },
    {
        id: 'frameActive', code: 'Enter',
        match: (e, code, ctx) => e.code === code && ctx.noModifiers && !insidePlaneContent(e) && !!ctx.state.space.activePlaneID,
        run: ({ dispatch, state, prevent }) => { prevent(); focusActivePlane(dispatch, state); },
    },
    {
        id: 'selectAll', code: 'KeyA',
        match: (e, code) => e.code === code && (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(actions.space.selectAll()); },
    },
    {
        id: 'invertSelection', code: 'KeyI',
        match: (e, code) => e.code === code && (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(actions.space.invertSelection()); },
    },
    {
        id: 'duplicateSelection', code: 'KeyD',
        match: (e, code, ctx) => e.code === code && (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && ctx.state.space.selectedPlaneIDs.length > 0,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(duplicateSelection() as any); },
    },
    {
        // Frame the selection: `.` (the CAD "zoom to selection").
        id: 'frameSelection', code: 'Period',
        match: (e, code, ctx) => e.code === code && ctx.noModifiers && ctx.state.space.selectedPlaneIDs.length > 0,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(frameSelection(true) as any); },
    },
    {
        id: 'toggleFirstPerson', code: 'KeyF',
        match: (e, code, ctx) => e.code === code && ctx.noModifiers,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(actions.configuration.toggleConfigurationSpaceFirstPerson()); },
    },
    {
        id: 'modeRotation', code: 'KeyR',
        match: (e, code, ctx) => e.code === code && ctx.noModifiers,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(actions.configuration.setConfigurationSpaceTransformMode(TRANSFORM_MODES.ROTATION)); },
    },
    {
        id: 'modeTranslation', code: 'KeyT',
        match: (e, code, ctx) => e.code === code && ctx.noModifiers,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(actions.configuration.setConfigurationSpaceTransformMode(TRANSFORM_MODES.TRANSLATION)); },
    },
    {
        id: 'modeScale', code: 'KeyS',
        match: (e, code, ctx) => e.code === code && ctx.noModifiers && !ctx.firstPerson,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(actions.configuration.setConfigurationSpaceTransformMode(TRANSFORM_MODES.SCALE)); },
    },
    {
        // Arrow-key transform nudges (rotate / translate / scale by step, gated on the axis locks).
        // Falls through (returns false) when no axis matches, so a plain arrow still reaches the host.
        id: 'transformNudge',
        match: (e) => e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown',
        run: (ctx) => runTransformNudge(ctx),
    },
    {
        id: 'focusPlane', code: 'KeyF',
        match: (e, code) => e.altKey && e.code === code,
        run: ({ dispatch, state, prevent }) => { prevent(); focusActivePlane(dispatch, state); },
    },
    {
        id: 'focusParent', code: 'KeyB',
        match: (e, code) => e.altKey && e.code === code,
        run: ({ dispatch, state, prevent }) => { prevent(); focusParentActivePlane(dispatch, state); },
    },
    {
        id: 'refreshPlane', code: 'KeyR',
        match: (e, code) => e.altKey && e.code === code,
        run: ({ state, pubsub, prevent }) => { prevent(); refreshActivePlane(state, pubsub); },
    },
    {
        id: 'isolatePlane', code: 'KeyE',
        match: (e, code) => e.altKey && e.code === code,
        run: ({ state, pubsub, prevent }) => { prevent(); isolateActivePlane(state, pubsub); },
    },
    {
        id: 'openClosedPlane', code: 'KeyT',
        match: (e, code) => e.altKey && e.shiftKey && e.code === code,
        run: ({ pubsub, prevent }) => { prevent(); openClosedPlane(pubsub); },
    },
    {
        id: 'closePlane', code: 'KeyW',
        match: (e, code) => e.altKey && e.code === code,
        run: ({ state, pubsub, prevent }) => { prevent(); closeActivePlane(state, pubsub); },
    },
    {
        id: 'focusPreviousRoot', code: 'KeyA',
        match: (e, code) => e.altKey && e.code === code,
        run: ({ dispatch, state, prevent }) => { prevent(); focusPreviousRoot(dispatch, state); },
    },
    {
        id: 'focusNextRoot', code: 'KeyD',
        match: (e, code) => e.altKey && e.code === code,
        run: ({ dispatch, state, prevent }) => { prevent(); focusNextRoot(dispatch, state); },
    },
    {
        id: 'cycleRoot', code: 'Tab',
        match: (e, code) => e.altKey && e.code === code,
        run: ({ dispatch, state, event, prevent }) => {
            prevent();
            if (event.shiftKey) { focusPreviousRoot(dispatch, state); } else { focusNextRoot(dispatch, state); }
        },
    },
    {
        // Alt+Digit jumps to a root by index — `code` matching is `startsWith('Digit')`, not exact, so
        // it ignores `keymap` (kept special).
        id: 'focusRootIndex',
        match: (e) => e.altKey && e.code.startsWith('Digit'),
        run: ({ dispatch, state, event, prevent }) => {
            prevent();
            const index = parseInt(event.code.replace('Digit', '')) - 1;
            focusRootIndex(dispatch, state, index);
        },
    },
];


export const handleGlobalShortcuts = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    state: AppState,
    pubsub: IPluridPubSub,
    event: KeyboardEvent,
    firstPerson: boolean,
    locks: PluridConfigurationSpaceTransformLocks,
    shortcuts?: PluridConfigurationSpaceShortcuts,
) => {
    if (event.defaultPrevented) {
        return;
    }

    const inputOnPath = dom.verifyPathInputElement(
        dom.getEventPath(event),
    ) || isEditableTarget(event.target);
    if (inputOnPath) {
        // The engine never consumes keys typed into inputs / editors; `onUnhandledKey` is deliberately
        // NOT fired here either, so a host doesn't react to ordinary typing.
        return;
    }

    const disabledAll = shortcuts?.disabled === true;
    const disabledSet = Array.isArray(shortcuts?.disabled)
        ? new Set(shortcuts?.disabled)
        : null;
    const keymap = shortcuts?.keymap;

    const ctx: ShortcutContext = {
        dispatch,
        state,
        pubsub,
        event,
        firstPerson,
        locks,
        noModifiers: !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey,
        prevent: () => event.preventDefault(),
    };

    if (!disabledAll) {
        for (const binding of SHORTCUTS) {
            if (disabledSet && disabledSet.has(binding.id)) {
                continue;
            }
            const code = (keymap && keymap[binding.id]) || binding.code;
            if (!binding.match(event, code, ctx)) {
                continue;
            }
            // `run` returns `false` only when the matched binding decided not to act (the arrow
            // nudge with every relevant axis locked) — fall through to the next binding / unhandled.
            if (binding.run(ctx) !== false) {
                return;
            }
        }
    }

    // Nothing in the engine consumed this key — hand it to the host so it can add its own bindings.
    if (shortcuts?.onUnhandledKey) {
        shortcuts.onUnhandledKey(event);
    }
}



// #endregion module
