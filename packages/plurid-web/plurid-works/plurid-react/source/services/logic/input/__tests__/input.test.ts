// #region imports
    // #region external
    import {
        normalizeWheel,
        wheelToDelta,
    } from '../wheel';

    import {
        resolveGestureIntent,
        applyLocks,
        GestureContext,
    } from '../gesture';

    import {
        createFrameBatcher,
        mergeCameraDeltas,
    } from '../frame';
    // #endregion external
// #endregion imports



// #region module
const locks = {
    rotationX: true,
    rotationY: true,
    translationX: true,
    translationY: true,
    translationZ: true,
    scale: true,
};

const mouse = (over: Partial<GestureContext> = {}): GestureContext => ({
    pointerType: 'mouse',
    button: 0,
    buttons: 1,
    shift: false,
    alt: false,
    ctrl: false,
    meta: false,
    onPlane: false,
    onSelectedPlane: false,
    onEditable: false,
    onControl: false,
    grabMode: false,
    firstPerson: false,
    transformMode: 'ALL',
    ...over,
});


describe('normalizeWheel', () => {
    it('converts line and page deltas to pixels', () => {
        expect(normalizeWheel({ deltaX: 0, deltaY: 3, deltaMode: 1, ctrlKey: false }, 800).dy).toBe(48);
        expect(normalizeWheel({ deltaX: 0, deltaY: 1, deltaMode: 2, ctrlKey: false }, 800).dy).toBe(800);
        expect(normalizeWheel({ deltaX: 0, deltaY: 100, deltaMode: 0, ctrlKey: false }, 800).dy).toBe(100);
    });

    it('classifies mouse notches and trackpad scrolls', () => {
        expect(normalizeWheel({ deltaX: 0, deltaY: 100, deltaMode: 0, ctrlKey: false }, 800).source).toBe('mouse');
        expect(normalizeWheel({ deltaX: 0, deltaY: 3, deltaMode: 1, ctrlKey: false }, 800).source).toBe('mouse');
        expect(normalizeWheel({ deltaX: 2.5, deltaY: -1.5, deltaMode: 0, ctrlKey: false }, 800).source).toBe('trackpad');
        expect(normalizeWheel({ deltaX: 0, deltaY: -7, deltaMode: 0, ctrlKey: true }, 800).pinch).toBe(true);
    });

    it('a Firefox line notch and a Chrome pixel notch zoom within a few percent of each other', () => {
        const chrome = normalizeWheel({ deltaX: 0, deltaY: -100, deltaMode: 0, ctrlKey: true }, 800);
        const firefox = normalizeWheel({ deltaX: 0, deltaY: -6, deltaMode: 1, ctrlKey: true }, 800);
        const base = { transformMode: 'ALL' as const, grabMode: false, firstPerson: false, onPlane: false, scrollable: false, shift: false, alt: false, ctrlOrMeta: true, locks, anchor: { x: 0, y: 0 } };
        const a = wheelToDelta(chrome, base);
        const b = wheelToDelta(firefox, base);
        expect(a.kind).toBe('camera');
        expect(b.kind).toBe('camera');
        const fa = (a as any).delta.zoom.factor;
        const fb = (b as any).delta.zoom.factor;
        expect(Math.abs(fa - fb) / fa).toBeLessThan(0.05);
    });
});


describe('wheelToDelta', () => {
    const base = {
        transformMode: 'ALL' as const,
        grabMode: false,
        firstPerson: false,
        onPlane: false,
        scrollable: false,
        shift: false,
        alt: false,
        ctrlOrMeta: false,
        locks,
        anchor: { x: 10, y: 20 },
    };
    const mouseDown = { dx: 0, dy: 100, pinch: false, source: 'mouse' as const };
    const trackpad = { dx: -3, dy: 5.5, pinch: false, source: 'trackpad' as const };

    it('a mouse wheel on empty space zooms at the cursor', () => {
        const resolution = wheelToDelta(mouseDown, base);
        expect(resolution.kind).toBe('camera');
        expect((resolution as any).delta.zoom.anchor).toEqual({ x: 10, y: 20 });
        expect((resolution as any).delta.zoom.factor).toBeCloseTo(1 / 1.1, 9);
    });

    it('scroll-first hands a scrollable plane its wheel, ctrl+wheel still zooms', () => {
        expect(wheelToDelta(mouseDown, { ...base, onPlane: true, scrollable: true }).kind).toBe('scroll');
        expect(wheelToDelta(mouseDown, { ...base, onPlane: true, scrollable: true, ctrlOrMeta: true }).kind).toBe('camera');
        expect(wheelToDelta(mouseDown, { ...base, onPlane: true, scrollable: true, policy: 'zoom' }).kind).toBe('camera');
        expect(wheelToDelta(mouseDown, { ...base, policy: 'disabled' }).kind).toBe('scroll');
    });

    it('a trackpad scroll pans by default and follows trackpadScroll', () => {
        const pan = wheelToDelta(trackpad, base);
        expect((pan as any).delta.pan).toEqual({ x: 3, y: -5.5 });
        expect((wheelToDelta(trackpad, { ...base, trackpadScroll: 'zoom' }) as any).delta.zoom).toBeDefined();
        expect((wheelToDelta(trackpad, { ...base, trackpadScroll: 'orbit' }) as any).delta.pitch).toBeDefined();
        expect(wheelToDelta(trackpad, { ...base, trackpadScroll: 'disabled' }).kind).toBe('scroll');
    });

    it('modes and modifiers pin the intent', () => {
        expect((wheelToDelta(mouseDown, { ...base, transformMode: 'ROTATION' }) as any).delta.pitch).toBeLessThan(0);
        expect((wheelToDelta(mouseDown, { ...base, transformMode: 'TRANSLATION' }) as any).delta.pan.y).toBe(-100);
        expect((wheelToDelta(mouseDown, { ...base, transformMode: 'TRANSLATION', alt: true }) as any).delta.dolly).toBe(-100);
        expect((wheelToDelta(mouseDown, { ...base, shift: true }) as any).delta.pitch).toBeDefined();
        expect((wheelToDelta(mouseDown, { ...base, alt: true }) as any).delta.pan).toBeDefined();
        expect((wheelToDelta(mouseDown, { ...base, shift: true, alt: true }) as any).delta.dolly).toBeDefined();
        expect((wheelToDelta(mouseDown, { ...base, grabMode: true, onPlane: true, scrollable: true }) as any).delta.zoom).toBeDefined();
    });

    it('locks turn a camera resolution into a scroll', () => {
        expect(wheelToDelta(mouseDown, { ...base, locks: { ...locks, scale: false } }).kind).toBe('scroll');
    });
});


describe('resolveGestureIntent', () => {
    it('orbits on empty space and leaves plane content to the page', () => {
        expect(resolveGestureIntent(mouse())).toBe('orbit');
        expect(resolveGestureIntent(mouse({ onPlane: true }))).toBe('none');
        expect(resolveGestureIntent(mouse({ onPlane: true, grabMode: true }))).toBe('orbit');
    });

    it('right, middle, shift pan; alt dollies; editable and controls are untouched', () => {
        expect(resolveGestureIntent(mouse({ button: 2, buttons: 2 }))).toBe('pan');
        expect(resolveGestureIntent(mouse({ button: 2, buttons: 2, onPlane: true }))).toBe('none');
        expect(resolveGestureIntent(mouse({ button: 2, buttons: 2, onPlane: true, grabMode: true }))).toBe('pan');
        expect(resolveGestureIntent(mouse({ button: 1, buttons: 4, onPlane: true }))).toBe('pan');
        expect(resolveGestureIntent(mouse({ shift: true, onPlane: true }))).toBe('pan');
        expect(resolveGestureIntent(mouse({ alt: true }))).toBe('dolly');
        expect(resolveGestureIntent(mouse({ onEditable: true, grabMode: true }))).toBe('none');
        expect(resolveGestureIntent(mouse({ onControl: true, button: 2 }))).toBe('none');
        expect(resolveGestureIntent(mouse({ pointerType: 'pen', buttons: 32 }))).toBe('pan');
    });

    it('a selected plane moves on a plain left drag', () => {
        expect(resolveGestureIntent(mouse({ onPlane: true, onSelectedPlane: true }))).toBe('move-selection');
        expect(resolveGestureIntent(mouse({ onPlane: true, onSelectedPlane: true, shift: true }))).toBe('pan');
    });

    it('buttonMap overrides the defaults, menu releases the right button', () => {
        expect(resolveGestureIntent(mouse({ onPlane: true, buttonMap: { left: 'orbit' } }))).toBe('orbit');
        expect(resolveGestureIntent(mouse({ buttonMap: { left: 'disabled' } }))).toBe('none');
        expect(resolveGestureIntent(mouse({ button: 2, buttons: 2, buttonMap: { right: 'menu' } }))).toBe('none');
        expect(resolveGestureIntent(mouse({ button: 2, buttons: 2, buttonMap: { right: 'orbit' } }))).toBe('orbit');
    });

    it('touch: one finger orbits on empty space and scrolls a plane', () => {
        expect(resolveGestureIntent(mouse({ pointerType: 'touch', buttons: 1 }))).toBe('orbit');
        expect(resolveGestureIntent(mouse({ pointerType: 'touch', buttons: 1, onPlane: true }))).toBe('none');
        expect(resolveGestureIntent(mouse({ pointerType: 'touch', buttons: 1, onPlane: true, grabMode: true }))).toBe('orbit');
        expect(resolveGestureIntent(mouse({ pointerType: 'touch', buttons: 1, touchOne: 'pan' }))).toBe('pan');
    });

    it('explicit modes and fly mode pin the intent', () => {
        expect(resolveGestureIntent(mouse({ transformMode: 'ROTATION', onPlane: true }))).toBe('orbit');
        expect(resolveGestureIntent(mouse({ transformMode: 'TRANSLATION' }))).toBe('pan');
        expect(resolveGestureIntent(mouse({ transformMode: 'TRANSLATION', alt: true }))).toBe('dolly');
        expect(resolveGestureIntent(mouse({ transformMode: 'SCALE' }))).toBe('zoom');
        expect(resolveGestureIntent(mouse({ firstPerson: true, onPlane: true }))).toBe('look');
        expect(resolveGestureIntent(mouse({ firstPerson: true, button: 2, buttons: 2 }))).toBe('pan');
    });

    it('applyLocks() drops the forbidden axes', () => {
        const delta = applyLocks(
            { yaw: 1, pitch: 2, pan: { x: 3, y: 4 }, dolly: 5, zoom: { factor: 2 }, look: { yaw: 1, pitch: 1 } },
            { ...locks, rotationX: false, translationX: false, translationZ: false, scale: false },
        );
        expect(delta.pitch).toBeUndefined();
        expect(delta.yaw).toBe(1);
        expect(delta.pan).toEqual({ x: 0, y: 4 });
        expect(delta.dolly).toBeUndefined();
        expect(delta.zoom).toBeUndefined();
        expect(delta.look).toEqual({ yaw: 1, pitch: 0 });
    });
});


describe('frame batcher', () => {
    it('merges the deltas of a frame into one flush', () => {
        const callbacks: (() => void)[] = [];
        const flushed: any[] = [];
        const batcher = createFrameBatcher(
            (delta) => flushed.push(delta),
            (callback) => { callbacks.push(callback); return callbacks.length; },
            () => {},
        );

        batcher.add({ yaw: 1, pan: { x: 1, y: 0 } });
        batcher.add({ yaw: 2, pan: { x: 0, y: 3 }, zoom: { factor: 2, anchor: { x: 1, y: 1 } } });
        batcher.add({ zoom: { factor: 1.5 } });
        expect(flushed).toHaveLength(0);
        expect(callbacks).toHaveLength(1);

        callbacks[0]();
        expect(flushed).toHaveLength(1);
        expect(flushed[0].yaw).toBe(3);
        expect(flushed[0].pan).toEqual({ x: 1, y: 3 });
        expect(flushed[0].zoom).toEqual({ factor: 3, anchor: { x: 1, y: 1 } });
    });

    it('flushNow() lands the queue synchronously and cancel() drops it', () => {
        const flushed: any[] = [];
        const batcher = createFrameBatcher((delta) => flushed.push(delta), () => 1, () => {});
        batcher.add({ pitch: 4 });
        batcher.flushNow();
        expect(flushed).toEqual([{ pitch: 4 }]);
        batcher.add({ pitch: 4 });
        batcher.cancel();
        batcher.flushNow();
        expect(flushed).toHaveLength(1);
        expect(mergeCameraDeltas({}, {})).toEqual({});
    });
});
// #endregion module
