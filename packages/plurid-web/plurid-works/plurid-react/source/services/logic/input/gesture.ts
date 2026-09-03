// #region imports
    // #region libraries
    import {
        CameraDelta,
        PluridConfigurationSpaceGesturesButtonMap,
        PluridConfigurationSpaceTransformLocks,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export type GestureIntent =
    | 'orbit'
    | 'pan'
    | 'dolly'
    | 'zoom'
    | 'look'
    | 'move-selection'
    | 'marquee'
    | 'none';

export type PointerKind =
    | 'mouse'
    | 'pen'
    | 'touch';

export interface GestureContext {
    pointerType: PointerKind;
    /** 0 left, 1 middle, 2 right (touch reports 0). */
    button: number;
    /** The `buttons` bitmask (pen barrel = 32). */
    buttons: number;
    shift: boolean;
    alt: boolean;
    ctrl: boolean;
    meta: boolean;
    /** The pointer went down inside a plane. */
    onPlane: boolean;
    /** … inside a plane that is part of the current selection. */
    onSelectedPlane: boolean;
    /** … inside a text field / editor. */
    onEditable: boolean;
    /** … on an engine control or a link / button. */
    onControl: boolean;
    /** G toggled or Space held. */
    grabMode: boolean;
    firstPerson: boolean;
    transformMode: 'ALL' | 'ROTATION' | 'TRANSLATION' | 'SCALE';
    buttonMap?: PluridConfigurationSpaceGesturesButtonMap;
    /** `gestures.touchOne`: what one finger does on empty space. Default `orbit`. */
    touchOne?: 'orbit' | 'pan' | 'disabled';
}


const mapped = (
    value: 'orbit' | 'pan' | 'zoom' | 'dolly' | 'disabled' | 'menu' | undefined,
): GestureIntent | undefined => {
    if (value === undefined) {
        return undefined;
    }
    if (value === 'disabled' || value === 'menu') {
        return 'none';
    }
    return value;
};


/**
 * THE mapping table: what a pointer press starts. The planes-are-pages rule wins on content — a
 * left press over a plane is the page's (text selection, drag-scroll) unless grab mode is on or the
 * host mapped the button. Empty space orbits. Right / middle / Shift pan; Alt dollies.
 */
export const resolveGestureIntent = (
    ctx: GestureContext,
): GestureIntent => {
    if (ctx.onEditable || ctx.onControl) {
        return 'none';
    }

    // Explicit modes pin the intent for every button.
    if (ctx.firstPerson) {
        if (ctx.button === 1 || ctx.button === 2 || (ctx.buttons & 32) === 32) {
            return 'pan';
        }
        return 'look';
    }
    if (ctx.transformMode === 'ROTATION') {
        return 'orbit';
    }
    if (ctx.transformMode === 'TRANSLATION') {
        return ctx.alt ? 'dolly' : 'pan';
    }
    if (ctx.transformMode === 'SCALE') {
        return 'zoom';
    }

    // Drag-to-move: a plain left press on an already-selected plane moves the selection.
    if (
        ctx.button === 0
        && ctx.onSelectedPlane
        && !ctx.shift
        && !ctx.alt
        && !ctx.grabMode
        && ctx.pointerType !== 'touch'
    ) {
        return 'move-selection';
    }

    if (ctx.pointerType === 'touch') {
        if (ctx.onPlane && !ctx.grabMode) {
            return 'none';
        }
        const touch = ctx.buttonMap?.touchOne ?? ctx.touchOne ?? 'orbit';
        return touch === 'disabled' ? 'none' : touch;
    }

    // Rubber-band selection: ⌘/Ctrl + a left press on EMPTY space (over a plane, ⌘/Ctrl-click is
    // the selection toggle and the press stays the page's). Shift adds to, Alt subtracts from the
    // selection at release.
    if (
        ctx.button === 0
        && (ctx.ctrl || ctx.meta)
        && !ctx.onPlane
        && !ctx.grabMode
    ) {
        return 'marquee';
    }

    // A host `buttonMap` is authoritative for the initiating button.
    const override = ctx.button === 0
        ? mapped(ctx.buttonMap?.left)
        : ctx.button === 1
            ? mapped(ctx.buttonMap?.middle)
            : ctx.button === 2
                ? mapped(ctx.buttonMap?.right)
                : undefined;
    if (override !== undefined) {
        return override;
    }

    if ((ctx.buttons & 32) === 32) {
        return 'pan';
    }
    if (ctx.button === 1) {
        return 'pan';
    }
    if (ctx.button === 2) {
        // Over a plane the right button keeps the page's context menu; on empty space (or in grab
        // mode) a right press pans — and, since the browser opens the menu on press on some
        // platforms, the menu is suppressed for the navigation press.
        return ctx.onPlane && !ctx.grabMode ? 'none' : 'pan';
    }
    if (ctx.button !== 0) {
        return 'none';
    }

    if (ctx.shift) {
        return 'pan';
    }
    if (ctx.alt) {
        return 'dolly';
    }
    if (ctx.grabMode) {
        return 'orbit';
    }
    if (ctx.onPlane) {
        return 'none';
    }

    return 'orbit';
};


/** Drop the components of a delta that the `transformLocks` forbid (`true` = allowed). */
export const applyLocks = (
    delta: CameraDelta,
    locks: PluridConfigurationSpaceTransformLocks | undefined,
): CameraDelta => {
    if (!locks) {
        return delta;
    }

    const next: CameraDelta = { ...delta };

    if (!locks.rotationX) {
        delete next.pitch;
        if (next.look) {
            next.look = { ...next.look, pitch: 0 };
        }
    }
    if (!locks.rotationY) {
        delete next.yaw;
        if (next.look) {
            next.look = { ...next.look, yaw: 0 };
        }
    }
    if (next.pan && (!locks.translationX || !locks.translationY)) {
        next.pan = {
            x: locks.translationX ? next.pan.x : 0,
            y: locks.translationY ? next.pan.y : 0,
        };
    }
    if (!locks.translationZ) {
        delete next.dolly;
        if (next.fly) {
            next.fly = { ...next.fly, forward: 0 };
        }
    }
    if (!locks.scale) {
        delete next.zoom;
    }

    return next;
};
// #endregion module
