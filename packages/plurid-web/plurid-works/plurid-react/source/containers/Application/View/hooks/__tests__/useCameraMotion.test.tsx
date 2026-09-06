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
});
// #endregion module
