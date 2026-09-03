/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, {
        act,
        useRef,
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
        reducer,
        actions,
    } from '~services/state/modules/space';

    import useCameraMotion from '../useCameraMotion';
    import {
        CameraMotionController,
    } from '~services/logic/motion';
    // #endregion external
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const view = { width: 1000, height: 600 };

/** A controllable rAF + clock. */
const installFrameClock = () => {
    let now = 0;
    let queue: FrameRequestCallback[] = [];
    (window as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
        queue.push(callback);
        return queue.length;
    };
    (window as any).cancelAnimationFrame = () => {
        queue = [];
    };
    // the hook reads the GLOBAL clock
    jest.spyOn(globalThis.performance, 'now').mockImplementation(() => now);
    return {
        advance: (milliseconds: number) => {
            now += milliseconds;
            const callbacks = queue;
            queue = [];
            for (const callback of callbacks) {
                callback(now);
            }
        },
        pending: () => queue.length,
    };
};

const mountHook = (
    reducedMotionMatches = false,
) => {
    (window as any).matchMedia = () => ({ matches: reducedMotionMatches, addEventListener: () => {}, removeEventListener: () => {} });

    let space = reducer(reducer(undefined, { type: '@@init' }), actions.setViewSize(view));
    const stateRef: any = { current: { space, configuration: defaultConfiguration } };
    const dispatched: any[] = [];
    const dispatch: any = (action: any) => {
        dispatched.push(action);
        space = reducer(space, action);
        stateRef.current = { space, configuration: defaultConfiguration };
        return action;
    };

    let controller: CameraMotionController | undefined;
    const Probe = () => {
        const reference = useRef(stateRef);
        controller = useCameraMotion({
            dispatch,
            stateRef: reference.current,
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
        dispatched,
        camera: () => space.camera,
        unmount: () => act(() => root.unmount()),
    };
};


describe('useCameraMotion', () => {
    it('tweens to the target with one commit per frame and lands exactly', () => {
        const clock = installFrameClock();
        const hook = mountHook();
        const target = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 90, pan: { x: 200, y: 0 } }, view);

        act(() => {
            hook.controller().tweenTo(target, { duration: 100 });
        });
        expect(hook.controller().isActive()).toBe(true);

        const commitsBefore = hook.dispatched.filter((action) => action.type === 'space/setCamera').length;
        act(() => { clock.advance(50); });
        const midway = hook.camera();
        expect(midway.yaw).toBeGreaterThan(0);
        expect(midway.yaw).toBeLessThan(90);
        act(() => { clock.advance(30); });
        act(() => { clock.advance(30); });
        const commits = hook.dispatched.filter((action) => action.type === 'space/setCamera').length - commitsBefore;
        expect(commits).toBe(3);
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

    it('reduced motion collapses a tween to one commit', () => {
        const clock = installFrameClock();
        const hook = mountHook(true);
        const target = cameraEngine.applyCameraDelta(hook.camera(), { yaw: 45 }, view);
        const before = hook.dispatched.filter((action) => action.type === 'space/setCamera').length;
        act(() => { hook.controller().tweenTo(target, { duration: 300 }); });
        expect(hook.dispatched.filter((action) => action.type === 'space/setCamera').length - before).toBe(1);
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
