// #region imports
    // #region external
    import {
        normalizeWheel,
        wheelToDelta,
        createWheelHistory,
    } from '../wheel';

    import {
        resolveGestureIntent,
        applyLocks,
        GestureContext,
    } from '../gesture';

    import {
        createFrameBatcher,
        createSmoothedBatcher,
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


describe('normalizeWheel with a history', () => {
    it('a fast flick inside a trackpad stream stays a trackpad; an isolated notch is a mouse', () => {
        let time = 0;
        const history = createWheelHistory(() => time);
        const at = (t: number, deltaY: number, deltaX = 0, ctrlKey = false) => { time = t; return normalizeWheel({ deltaX, deltaY, deltaMode: 0, ctrlKey }, 800, history).source; };
        expect(at(0, 12.5)).toBe('trackpad');
        // 87 and 120 px, 30 ms later: the flick of the same two-finger gesture
        expect(at(30, 87)).toBe('trackpad');
        expect(at(60, 120)).toBe('trackpad');
        expect(at(90, 100)).toBe('trackpad');
        // a real notch, half a second after the stream ended
        expect(at(600, 100)).toBe('mouse');
        expect(at(620, 100)).toBe('mouse');
        // and a fresh trackpad stream after that
        expect(at(1200, 3)).toBe('trackpad');
        expect(at(1210, 80)).toBe('trackpad');
    });

    it('a pinch is trackpad-class whatever its size; a Ctrl + notch outside a stream is a mouse', () => {
        let time = 0;
        const history = createWheelHistory(() => time);
        const at = (t: number, deltaY: number) => { time = t; return normalizeWheel({ deltaX: 0, deltaY, deltaMode: 0, ctrlKey: true }, 800, history); };
        expect(at(0, -6).source).toBe('trackpad');
        expect(at(20, -45).source).toBe('trackpad');
        expect(at(40, -60).source).toBe('trackpad');
        expect(at(40, -60).pinch).toBe(true);
        expect(at(900, -100).source).toBe('mouse');
    });

    it('without a history the magnitude rule holds', () => {
        expect(normalizeWheel({ deltaX: 0, deltaY: 100, deltaMode: 0, ctrlKey: false }, 800).source).toBe('mouse');
        expect(normalizeWheel({ deltaX: 0, deltaY: 87, deltaMode: 0, ctrlKey: false }, 800).source).toBe('trackpad');
        expect(normalizeWheel({ deltaX: 0, deltaY: 3, deltaMode: 1, ctrlKey: false }, 800).source).toBe('mouse');
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

    it('a trackpad pinch zooms by an exponent per px; a Ctrl + mouse notch keeps the notch step', () => {
        const pinch = wheelToDelta({ dx: 0, dy: -10, pinch: true, source: 'trackpad' }, base);
        expect(pinch.kind).toBe('camera');
        // e^(10 · 0.006) — the notch step would have given 1.1^0.1 ≈ 1.0096
        expect((pinch as any).delta.zoom.factor).toBeCloseTo(Math.exp(0.06), 9);
        expect((pinch as any).delta.zoom.anchor).toEqual({ x: 10, y: 20 });
        const outward = wheelToDelta({ dx: 0, dy: 10, pinch: true, source: 'trackpad' }, base);
        expect((outward as any).delta.zoom.factor).toBeCloseTo(Math.exp(-0.06), 9);
        const tuned = wheelToDelta({ dx: 0, dy: -10, pinch: true, source: 'trackpad' }, { ...base, trackpadPinchSensitivity: 0.02 });
        expect((tuned as any).delta.zoom.factor).toBeCloseTo(Math.exp(0.2), 9);
        const notch = wheelToDelta({ dx: 0, dy: -100, pinch: false, source: 'mouse' }, { ...base, ctrlOrMeta: true });
        expect((notch as any).delta.zoom.factor).toBeCloseTo(1.1, 9);
    });

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


describe('smoothed batcher', () => {
    const harness = (rate = 0.35, frameMs = 1000 / 60) => {
        const frames: (() => void)[] = [];
        const flushed: any[] = [];
        let time = 0;
        const batcher = createSmoothedBatcher(
            (delta) => flushed.push(delta),
            { rate: () => rate, now: () => time },
            (callback) => { frames.push(callback); return frames.length; },
            () => { frames.length = 0; },
        );
        const tick = () => { time += frameMs; const frame = frames.shift(); if (frame) frame(); };
        return { batcher, flushed, tick, frames };
    };

    it('the rate is per 60 Hz frame: a 120 Hz display releases less per frame, the same per unit of time', () => {
        const fast = harness(0.6, 1000 / 120);
        fast.batcher.add({ pan: { x: 100, y: 0 } });
        fast.tick();
        // the first frame after a burst counts as a full 60 Hz frame: 60 %
        expect(fast.flushed[0].pan.x).toBeCloseTo(60, 9);
        fast.tick();
        // the next, 8.3 ms later, releases the square-root fraction of the remainder: 40 · (1 − √0.4)
        expect(fast.flushed[1].pan.x).toBeCloseTo(40 * (1 - Math.sqrt(0.4)), 6);
    });

    it('releases a burst over several frames and lands exactly on the total', () => {
        const { batcher, flushed, tick, frames } = harness();
        batcher.add({ pan: { x: 100, y: -40 } });
        batcher.add({ pan: { x: 0, y: -10 } });
        tick();
        expect(flushed[0].pan.x).toBeCloseTo(35, 9);
        expect(flushed[0].pan.y).toBeCloseTo(-17.5, 9);
        for (let i = 0; i < 40 && frames.length > 0; i++) {
            tick();
        }
        expect(batcher.pending()).toBe(false);
        const total = flushed.reduce((sum, delta) => ({ x: sum.x + (delta.pan?.x ?? 0), y: sum.y + (delta.pan?.y ?? 0) }), { x: 0, y: 0 });
        expect(total.x).toBeCloseTo(100, 9);
        expect(total.y).toBeCloseTo(-50, 9);
        expect(flushed.length).toBeGreaterThan(5);
    });

    it('smooths zoom in log space about the latest anchor; passes the rest of a delta through whole', () => {
        const { batcher, flushed, tick, frames } = harness();
        batcher.add({ zoom: { factor: 2, anchor: { x: 1, y: 1 } }, pivot: { x: 5, y: 6, z: 7 } });
        batcher.add({ zoom: { factor: 2, anchor: { x: 3, y: 4 } } });
        tick();
        expect(flushed[0].pivot).toEqual({ x: 5, y: 6, z: 7 });
        expect(flushed[0].zoom.anchor).toEqual({ x: 3, y: 4 });
        expect(flushed[0].zoom.factor).toBeCloseTo(Math.exp(Math.log(4) * 0.35), 9);
        for (let i = 0; i < 60 && frames.length > 0; i++) {
            tick();
        }
        const product = flushed.reduce((all, delta) => all * (delta.zoom?.factor ?? 1), 1);
        expect(product).toBeCloseTo(4, 6);
        expect(flushed.filter((delta) => delta.pivot)).toHaveLength(1);
    });

    it('rate 1 is the plain batcher; flushNow releases everything; cancel drops it', () => {
        const instant = harness(1);
        instant.batcher.add({ pan: { x: 30, y: 0 }, yaw: 4 });
        instant.tick();
        expect(instant.flushed).toEqual([{ pan: { x: 30, y: 0 }, yaw: 4 }]);
        expect(instant.batcher.pending()).toBe(false);

        const now = harness();
        now.batcher.add({ pan: { x: 30, y: 0 }, dolly: 8 });
        now.batcher.flushNow();
        expect(now.flushed).toEqual([{ pan: { x: 30, y: 0 }, dolly: 8 }]);

        const dropped = harness();
        dropped.batcher.add({ pan: { x: 30, y: 0 } });
        dropped.batcher.cancel();
        dropped.tick();
        expect(dropped.flushed).toEqual([]);
        expect(dropped.batcher.pending()).toBe(false);
    });
});
