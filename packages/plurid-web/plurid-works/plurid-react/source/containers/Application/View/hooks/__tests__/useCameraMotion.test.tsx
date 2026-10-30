/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, {
        act,
    } from 'react';
    import { createRoot, Root } from 'react-dom/client';

    import {
        interaction,
    } from '@plurid/plurid-engine';

    import {
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        AppState,
    } from '~services/state/store/reducer';
    import {
        CameraMotionController,
    } from '~services/logic/motion';

    import {
        TEST_VIEW as view,
    } from '../../../../../testing/fixtures';
    import {
        makeSpaceStore,
    } from '../../../../../testing/store';
    import {
        installFrameClock,
    } from '../../../../../testing';
    // #endregion external


    // #region internal
    import useCameraMotion from '../useCameraMotion';
    // #endregion internal
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

/** The reduced-motion query, answered as asked. */
const installReducedMotion = (
    matches: boolean,
) => {
    Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: (query: string): MediaQueryList => ({
            matches,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }),
    });
};

/** The hook mounted over a headless store; its state ref always reads the live store. */
const mountHook = (
    reducedMotion = false,
) => {
    installReducedMotion(reducedMotion);
    const store = makeSpaceStore(defaultConfiguration, []);
    const stateRef: React.MutableRefObject<AppState> = {
        get current() {
            return store.getState();
        },
        set current(_next: AppState) {},
    };

    let controller: CameraMotionController | undefined;
    const Probe = () => {
        controller = useCameraMotion({
            dispatch: store.dispatch,
            stateRef,
            spaceConfiguration: defaultConfiguration.space,
        });
        return null;
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    let root: Root;
    act(() => {
        root = createRoot(container);
        root.render(<Probe />);
    });

    return {
        controller: () => controller!,
        dispatched: store.dispatched,
        motions: () => store.dispatched.filter((action) => action.type === 'space/setMotion').map((action) => action.payload as string),
        commits: () => store.cameraCommits().length,
        camera: () => store.space().camera,
        unmount: () => {
            act(() => root.unmount());
            container.remove();
        },
    };
};


describe('useCameraMotion', () => {
    afterEach(() => {
        installFrameClock().restore();
    });

    it('tweens to the target with one commit per frame and lands exactly', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const target = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 90, pan: { x: 200, y: 0 } }, view);

        act(() => {
            hook.controller().tweenTo(target, { duration: 100 });
        });
        expect(hook.controller().isActive()).toBe(true);

        const commitsBefore = hook.commits();
        act(() => { clock.advance(50); });
        const midway = hook.camera();
        expect(midway.yaw).toBeGreaterThan(0);
        expect(midway.yaw).toBeLessThan(90);
        act(() => { clock.advance(30); });
        act(() => { clock.advance(30); });
        expect(hook.commits() - commitsBefore).toBe(3);
        expect(hook.camera().yaw).toBeCloseTo(90, 9);
        expect(hook.camera().offset.x).toBeCloseTo(target.offset.x, 9);
        expect(hook.controller().isActive()).toBe(false);
        expect(clock.pending()).toBe(0);
        hook.unmount();
    });

    it('cancel() mid-tween keeps the camera where it is', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const target = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 60 }, view);
        act(() => { hook.controller().tweenTo(target, { duration: 100 }); });
        act(() => { clock.advance(40); });
        const atCancel = hook.camera();
        act(() => { hook.controller().cancel(); });
        act(() => { clock.advance(100); });
        expect(hook.camera()).toEqual(atCancel);
        expect(hook.camera().yaw).toBeGreaterThan(0);
        expect(hook.camera().yaw).toBeLessThan(60);
        hook.unmount();
    });

    it('a retarget mid-tween leaves the store in `tween`, not `idle` (the controller records what it dispatched)', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const first = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 60 }, view);
        act(() => { hook.controller().tweenTo(first, { duration: 100 }); });
        act(() => { clock.advance(40); });
        const second = cameraEngine.applyCameraDelta(hook.camera(), { yaw: -90 }, view);
        act(() => { hook.controller().tweenTo(second, { duration: 100 }); });
        expect(hook.motions().pop()).toBe('tween');
        expect(hook.controller().isActive()).toBe(true);
        act(() => { clock.advance(100); });
        act(() => { clock.advance(10); });
        expect(hook.motions().pop()).toBe('idle');
        expect(hook.camera().yaw).toBeCloseTo(second.yaw, 9);
        hook.unmount();
    });

    it('a retarget to the SAME pose keeps the running tween instead of restarting it', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const target = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 60 }, view);
        act(() => { hook.controller().tweenTo(target, { duration: 100 }); });
        act(() => { clock.advance(40); });
        const motionsBefore = hook.motions().length;
        const atRetarget = hook.camera();
        act(() => { hook.controller().tweenTo(target, { duration: 100 }); });
        expect(hook.motions().length).toBe(motionsBefore);
        // the original timing holds: 60 more ms land it
        act(() => { clock.advance(30); });
        expect(hook.camera().yaw).toBeGreaterThan(atRetarget.yaw);
        act(() => { clock.advance(30); });
        act(() => { clock.advance(10); });
        expect(hook.camera().yaw).toBeCloseTo(60, 9);
        expect(hook.controller().isActive()).toBe(false);
        hook.unmount();
    });

    it('onSettle fires once the tween lands, at once for a jump, and never for a cancelled tween', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const settled: string[] = [];
        const target = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 60 }, view);
        act(() => { hook.controller().tweenTo(target, { duration: 100, onSettle: () => settled.push('tween') }); });
        act(() => { clock.advance(50); });
        expect(settled).toEqual([]);
        act(() => { clock.advance(60); });
        expect(settled).toEqual(['tween']);
        // already there: a jump, settled at once, no tween started
        let started = true;
        act(() => { started = hook.controller().tweenTo(hook.camera(), { duration: 100, onSettle: () => settled.push('jump') }); });
        expect(started).toBe(false);
        expect(settled).toEqual(['tween', 'jump']);
        // cancelled: never
        const other = cameraEngine.applyCameraDelta(hook.camera(), { yaw: -60 }, view);
        act(() => { hook.controller().tweenTo(other, { duration: 100, onSettle: () => settled.push('cancelled') }); });
        act(() => { clock.advance(30); });
        act(() => { hook.controller().cancel(); });
        act(() => { clock.advance(200); });
        expect(settled).toEqual(['tween', 'jump']);
        hook.unmount();
    });

    it('reduced motion collapses a tween to one commit', () => {
        const clock = installFrameClock();
        const hook = mountHook(true);
        const target = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 45 }, view);
        const before = hook.commits();
        act(() => { hook.controller().tweenTo(target, { duration: 300 }); });
        expect(hook.commits() - before).toBe(1);
        expect(hook.camera().yaw).toBeCloseTo(45, 9);
        expect(clock.pending()).toBe(0);
        hook.unmount();
    });

    it('a fling decays and stops; a new tween cancels it', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        act(() => { hook.controller().fling({ x: 1.5, y: 0 }, 'orbit'); });
        expect(hook.controller().isActive()).toBe(true);
        act(() => { clock.advance(16); });
        const afterOne = hook.camera().yaw;
        expect(afterOne).not.toBe(0);
        for (let index = 0; index < 400 && hook.controller().isActive(); index += 1) {
            act(() => { clock.advance(16); });
        }
        expect(hook.controller().isActive()).toBe(false);
        expect(Math.abs(hook.camera().yaw)).toBeGreaterThan(Math.abs(afterOne));
        hook.unmount();
    });

    it('a gesture holds the motion until it ends: it stops a tween where it is, and a fling takes over', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const target = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 60 }, view);
        act(() => { hook.controller().tweenTo(target, { duration: 100 }); });
        act(() => { clock.advance(40); });
        const grabbed = hook.camera();

        act(() => { hook.controller().gesture(true); });
        act(() => { clock.advance(100); });
        expect(hook.camera()).toEqual(grabbed);
        expect(hook.motions()).toEqual(['tween', 'idle', 'gesture']);

        // a release with velocity flings, and the fling keeps the motion past the gesture's end
        act(() => { hook.controller().fling({ x: 1, y: 0 }, 'orbit'); });
        act(() => { hook.controller().gesture(false); });
        expect(hook.motions().pop()).toBe('fling');
        act(() => { hook.controller().cancel(); });

        // a release without one is rest
        act(() => { hook.controller().gesture(true); });
        act(() => { hook.controller().gesture(false); });
        expect(hook.motions().slice(-2)).toEqual(['gesture', 'idle']);
        expect(clock.pending()).toBe(0);
        hook.unmount();
    });
});


describe('useCameraMotion: exclusive tweens (2026-10-30)', () => {
    afterEach(() => {
        installFrameClock().restore();
    });

    it('A NON-EXCLUSIVE TWEEN IS UNCHANGED: its onSettle rides another caller\'s retarget and fires at that landing', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const settled: string[] = [];
        const first = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 60 }, view);
        act(() => { hook.controller().tweenTo(first, { duration: 100, onSettle: () => settled.push('first') }); });
        act(() => { clock.advance(40); });
        const second = cameraEngine.applyCameraDelta(hook.camera(), { yaw: -30 }, view);
        act(() => { hook.controller().tweenTo(second, { duration: 100 }); });
        act(() => { clock.advance(120); });
        expect(settled).toEqual(['first']);
        expect(hook.camera().yaw).toBeCloseTo(second.yaw, 9);
        hook.unmount();
    });

    it('another caller\'s tween interrupts an exclusive one: it is told once, its onSettle never fires, nothing is carried', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const told: string[] = [];
        const stop = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 60 }, view);
        act(() => {
            hook.controller().tweenTo(stop, {
                duration: 100,
                onSettle: () => told.push('arrived'),
                onInterrupt: () => told.push('interrupted'),
            });
        });
        act(() => { clock.advance(40); });
        const elsewhere = cameraEngine.applyCameraDelta(hook.camera(), { yaw: -90 }, view);
        let activeWhenTold: boolean | undefined;
        act(() => {
            hook.controller().tweenTo(elsewhere, {
                duration: 100,
                onSettle: () => told.push('other landed'),
            });
            activeWhenTold = hook.controller().isActive();
        });
        expect(told).toEqual(['interrupted']);
        // told once the new tween was in place, never halfway through the retarget
        expect(activeWhenTold).toBe(true);
        act(() => { clock.advance(120); });
        expect(told).toEqual(['interrupted', 'other landed']);
        hook.unmount();
    });

    it('a cancel, a gesture, a fling and a jump interrupt it; a landing does not', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const told: string[] = [];
        const exclusive = (label: string) => ({
            duration: 100,
            onSettle: () => told.push(label + ' landed'),
            onInterrupt: () => told.push(label + ' interrupted'),
        });
        const away = (yaw: number) => cameraEngine.applyCameraDelta(hook.camera(), { yaw }, view);

        act(() => { hook.controller().tweenTo(away(30), exclusive('cancel')); });
        act(() => { clock.advance(20); });
        act(() => { hook.controller().cancel(); });

        act(() => { hook.controller().tweenTo(away(30), exclusive('gesture')); });
        act(() => { clock.advance(20); });
        act(() => { hook.controller().gesture(true); });
        act(() => { hook.controller().gesture(false); });

        act(() => { hook.controller().tweenTo(away(30), exclusive('fling')); });
        act(() => { clock.advance(20); });
        act(() => { hook.controller().fling({ x: 2, y: 0 }, 'orbit'); });
        act(() => { hook.controller().cancel(); });

        act(() => { hook.controller().tweenTo(away(30), exclusive('jump')); });
        act(() => { clock.advance(20); });
        act(() => { hook.controller().tweenTo(away(10), { duration: 0 }); });

        act(() => { hook.controller().tweenTo(away(30), exclusive('lands')); });
        act(() => { clock.advance(120); });

        expect(told).toEqual([
            'cancel interrupted',
            'gesture interrupted',
            'fling interrupted',
            'jump interrupted',
            'lands landed',
        ]);
        hook.unmount();
    });

    it('a retarget that CONTINUES it keeps both callbacks: the landing of the re-aimed tween is the arrival', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const told: string[] = [];
        const stop = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 60 }, view);
        act(() => {
            hook.controller().tweenTo(stop, {
                duration: 100,
                onSettle: () => told.push('arrived'),
                onInterrupt: () => told.push('interrupted'),
            });
        });
        act(() => { clock.advance(40); });
        // the plane moved: the engine re-aims the tween at where its stop is now
        const moved = cameraEngine.applyCameraDelta(stop, { pan: { x: 120, y: 0 } }, view);
        act(() => { hook.controller().tweenTo(moved, { duration: 100, continues: true }); });
        expect(told).toEqual([]);
        act(() => { clock.advance(120); });
        expect(told).toEqual(['arrived']);
        expect(hook.camera().offset.x).toBeCloseTo(moved.offset.x, 9);

        // and a continued tween is still exclusive: a cancel tells it
        act(() => { hook.controller().tweenTo(cameraEngine.applyCameraDelta(hook.camera(), { yaw: 20 }, view), { duration: 100, onInterrupt: () => told.push('again') }); });
        act(() => { clock.advance(20); });
        act(() => { hook.controller().tweenTo(cameraEngine.applyCameraDelta(hook.camera(), { yaw: 5 }, view), { duration: 100, continues: true }); });
        act(() => { hook.controller().cancel(); });
        expect(told).toEqual(['arrived', 'again']);
        hook.unmount();
    });

    it('another caller asking for the very pose it is going to joins it: both are told when it lands', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const told: string[] = [];
        const stop = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 60 }, view);
        act(() => { hook.controller().tweenTo(stop, { duration: 100, onSettle: () => told.push('tour'), onInterrupt: () => told.push('tour interrupted') }); });
        act(() => { clock.advance(40); });
        act(() => { hook.controller().tweenTo(stop, { duration: 100, onSettle: () => told.push('host') }); });
        act(() => { clock.advance(80); });
        expect(told).toEqual(['tour', 'host']);
        hook.unmount();
    });

    it('A STOP JOINING A HOST\'S TWEEN: the host\'s non-exclusive settle and the stop\'s callbacks are all kept', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const told: string[] = [];
        const pose = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 50 }, view);
        act(() => { hook.controller().tweenTo(pose, { duration: 100, onSettle: () => told.push('host landed') }); });
        act(() => { clock.advance(30); });
        act(() => { hook.controller().tweenTo(pose, { duration: 100, onSettle: () => told.push('stop landed'), onInterrupt: () => told.push('stop interrupted') }); });
        act(() => { clock.advance(100); });
        expect(told).toEqual(['host landed', 'stop landed']);

        // joined, then cancelled: the exclusive caller is told, the host (no `onInterrupt`) is not
        act(() => { hook.controller().tweenTo(cameraEngine.applyCameraDelta(hook.camera(), { yaw: 20 }, view), { duration: 100, onSettle: () => told.push('host 2') }); });
        act(() => { hook.controller().tweenTo(cameraEngine.applyCameraDelta(hook.camera(), { yaw: 20 }, view), { duration: 100, onInterrupt: () => told.push('stop 2 interrupted') }); });
        act(() => { hook.controller().cancel(); });
        expect(told).toEqual(['host landed', 'stop landed', 'stop 2 interrupted']);
        hook.unmount();
    });

    it('WHAT THE REPLACED CALLER HEARS: a non-exclusive settle rides the replacing tween, whatever it brings; a cancel drops it', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const told: string[] = [];
        act(() => { hook.controller().tweenTo(cameraEngine.applyCameraDelta(hook.camera(), { yaw: 60 }, view), { duration: 100, onSettle: () => told.push('host') }); });
        act(() => { clock.advance(30); });
        // a tour's stop elsewhere, with callbacks of its own: the host's settle is not dropped
        const stop = cameraEngine.applyCameraDelta(hook.camera(), { yaw: -40 }, view);
        act(() => { hook.controller().tweenTo(stop, { duration: 100, onSettle: () => told.push('stop'), onInterrupt: () => told.push('stop interrupted') }); });
        expect(told).toEqual([]);
        act(() => { clock.advance(30); });
        // and it rides on through a third caller, while the exclusive stop is told it did not land
        const third = cameraEngine.applyCameraDelta(hook.camera(), { pitch: -10 }, view);
        act(() => { hook.controller().tweenTo(third, { duration: 100, onSettle: () => told.push('third') }); });
        expect(told).toEqual(['stop interrupted']);
        act(() => { clock.advance(120); });
        expect(told).toEqual(['stop interrupted', 'host', 'third']);

        act(() => { hook.controller().tweenTo(cameraEngine.applyCameraDelta(hook.camera(), { yaw: 10 }, view), { duration: 100, onSettle: () => told.push('dropped') }); });
        act(() => { hook.controller().tweenTo(cameraEngine.applyCameraDelta(hook.camera(), { yaw: 30 }, view), { duration: 100 }); });
        act(() => { hook.controller().cancel(); });
        act(() => { clock.advance(200); });
        expect(told).toEqual(['stop interrupted', 'host', 'third']);
        hook.unmount();
    });

    it('under reduced motion it jumps and settles at once, and the tween it replaced is told first', () => {
        installFrameClock();
        const hook = mountHook(true);
        const told: string[] = [];
        act(() => {
            hook.controller().tweenTo(cameraEngine.applyCameraDelta(hook.camera(), { yaw: 45 }, view), {
                duration: 300,
                onSettle: () => told.push('landed'),
                onInterrupt: () => told.push('interrupted'),
            });
        });
        expect(told).toEqual(['landed']);
        expect(hook.controller().isActive()).toBe(false);
        hook.unmount();
    });
});
// #endregion module
