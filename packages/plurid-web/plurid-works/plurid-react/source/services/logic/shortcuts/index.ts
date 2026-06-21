// #region imports
    // #region libraries
    import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';


    import {
        dom,
    } from '@plurid/plurid-functions';

    import {
        TRANSFORM_MODES,
        directions,

        PluridConfigurationSpaceTransformLocks,
        PluridConfigurationSpaceShortcuts,
        PluridShortcutID,

        PluridPubSub as IPluridPubSub,
        TransformModes,
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
        interaction,
    } from '~services/engine';
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
        // Cmd/Ctrl+Z = undo, +Shift = redo. The `inputOnPath` guard lets an editor keep its own undo.
        id: 'undo', code: 'KeyZ',
        match: (e, code) => (e.metaKey || e.ctrlKey) && e.code === code,
        run: ({ dispatch, event, prevent }) => {
            prevent();
            dispatch(event.shiftKey ? actions.space.redo() : actions.space.undo());
        },
    },
    {
        // Escape clears the selection — only when something is selected, so an empty Escape still
        // reaches the host (help overlay, etc.) via `onUnhandledKey`.
        id: 'clearSelection', code: 'Escape',
        match: (e, code, ctx) => e.code === code && ctx.state.space.selectedPlaneIDs.length > 0,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(actions.space.clearSelection()); },
    },
    {
        // Frame all planes (CAD "fit"): Home or 0.
        id: 'fitToView', code: 'Digit0',
        match: (e, code, ctx) => (e.key === 'Home' || e.code === code) && ctx.noModifiers,
        run: ({ dispatch, prevent }) => { prevent(); dispatch(actions.space.spaceFitToView()); },
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
    );
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



// Smooth-zoom tuning: the scale delta is proportional to wheel/trackpad magnitude
// (continuous, CAD-like) instead of a fixed quantized step, clamped so a single
// aggressive notch can't jump across the whole scale range.
const SCALE_WHEEL_SENSITIVITY = 0.0015;
const SCALE_WHEEL_MAX_STEP = 0.2;

export const handleGlobalWheel = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
    event: WheelEvent,
    modes: TransformModes,
    locks: PluridConfigurationSpaceTransformLocks,
    grabMode: boolean = false,
) => {
    // The wheel only zooms the space while navigating (grab mode, scale mode, or
    // ⌘/Ctrl+wheel). Otherwise it's left alone so page/plane content scrolls normally.
    const wheelZooms = grabMode;
    if (event.shiftKey
        || event.metaKey
        || event.altKey
        || event.ctrlKey
        || modes.rotation
        || modes.translation
        || modes.scale
        || wheelZooms
    ) {
        event.preventDefault();
    }

    const deltas = {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
    };
    const absoluteThreshold = 100;
    const direction = interaction.direction.getWheelDirection(deltas, absoluteThreshold);

    if (modes.rotation) {
        if (direction === directions.left && locks.rotationY) {
            return dispatch(actions.space.rotateLeft());
        }

        if (direction === directions.right && locks.rotationY) {
            return dispatch(actions.space.rotateRight());
        }

        if (direction === directions.up && locks.rotationX) {
            return dispatch(actions.space.rotateUp());
        }

        if (direction === directions.down && locks.rotationX) {
            return dispatch(actions.space.rotateDown());
        }
    }

    if (event.shiftKey && !event.altKey) {
        if (direction === directions.up && locks.rotationX) {
            return dispatch(actions.space.rotateUp());
        }

        if (direction === directions.down && locks.rotationX) {
            return dispatch(actions.space.rotateDown());
        }

        if (direction === directions.left && locks.rotationY) {
            return dispatch(actions.space.rotateLeft());
        }

        if (direction === directions.right && locks.rotationY) {
            return dispatch(actions.space.rotateRight());
        }
    }

    if (modes.translation) {
        if (event.metaKey || event.ctrlKey) {
            if (direction === directions.up) {
                return dispatch(actions.space.translateDown());
            }

            if (direction === directions.down) {
                return dispatch(actions.space.translateUp());
            }

            return;
        }

        if (event.altKey) {
            if (direction === directions.up && locks.translationZ) {
                return dispatch(actions.space.translateIn());
            }

            if (direction === directions.down && locks.translationZ) {
                return dispatch(actions.space.translateOut());
            }
        }

        if (direction === directions.up && locks.translationY) {
            return dispatch(actions.space.translateDown());
        }

        if (direction === directions.down && locks.translationY) {
            return dispatch(actions.space.translateUp());
        }

        if (direction === directions.left && locks.translationX) {
            return dispatch(actions.space.translateRight());
        }

        if (direction === directions.right && locks.translationX) {
            return dispatch(actions.space.translateLeft());
        }
    }

    if (event.altKey && event.shiftKey) {
        if (direction === directions.up && locks.translationZ) {
            return dispatch(actions.space.translateIn());
        }

        if (direction === directions.down && locks.translationZ) {
            return dispatch(actions.space.translateOut());
        }
    }

    if (event.altKey && !event.shiftKey) {
        if (event.metaKey || event.ctrlKey) {
            if (direction === directions.up) {
                return dispatch(actions.space.translateDown());
            }

            if (direction === directions.down) {
                return dispatch(actions.space.translateUp());
            }

            return;
        }

        if (direction === directions.up && locks.translationY) {
            return dispatch(actions.space.translateDown());
        }

        if (direction === directions.down && locks.translationY) {
            return dispatch(actions.space.translateUp());
        }

        if (direction === directions.left && locks.translationX) {
            return dispatch(actions.space.translateRight());
        }

        if (direction === directions.right && locks.translationX) {
            return dispatch(actions.space.translateLeft());
        }
    }

    // Smooth, proportional zoom toward the cursor. The wheel/trackpad magnitude drives
    // the scale delta directly (continuous, not a quantized fixed step), and ⌘/Ctrl+wheel
    // zooms from any mode — matching trackpad pinch. Convention: wheel up (deltaY < 0) =
    // zoom in. The point under the cursor stays anchored (CAD-standard).
    if (modes.scale || event.metaKey || event.ctrlKey || wheelZooms) {
        if (!locks.scale) {
            return;
        }

        const zoomAmount = Math.min(
            Math.abs(event.deltaY) * SCALE_WHEEL_SENSITIVITY,
            SCALE_WHEEL_MAX_STEP,
        );

        if (zoomAmount === 0) {
            return;
        }

        const deltaScale = event.deltaY < 0 ? zoomAmount : -zoomAmount;

        const target = event.currentTarget as HTMLElement | null;
        const rect = target && target.getBoundingClientRect
            ? target.getBoundingClientRect()
            : null;
        const originX = rect ? event.clientX - rect.left : event.clientX;
        const originY = rect ? event.clientY - rect.top : event.clientY;

        return dispatch(actions.space.zoomAtPoint({
            deltaScale,
            originX,
            originY,
        }));
    }

    return;
}
// #endregion module
