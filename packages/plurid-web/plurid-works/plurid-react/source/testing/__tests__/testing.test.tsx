/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
        gestures,
        flushFrames,
        expectCamera,
        installFrameClock,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
const planes = [
    { route: '/one', component: () => <div style={{ height: 200 }}>one</div> },
    { route: '/two', component: () => <div style={{ height: 200 }}>two</div> },
];


describe('@plurid/plurid-react/testing', () => {
    it('renders an application, hands back the api and the handle, and drives the camera', async () => {
        const clock = installFrameClock();
        const rendered = await renderPlurid({
            planes,
            view: ['/one', '/two'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        });

        expect(rendered.api.getSnapshot().space.tree).toHaveLength(2);
        expect(rendered.view).toBeTruthy();
        expect(rendered.handle).toBeTruthy();

        rendered.handle.camera.moveBy({ yaw: 30, pitch: -10 });
        expectCamera(rendered.api.getSnapshot().space.camera).toBeNear({ yaw: 30, pitch: -10 });

        rendered.handle.camera.reset({ animate: false });
        expectCamera(rendered.api.getSnapshot().space.camera).toBeNear({ yaw: 0, pitch: 0, scale: 1 });

        // ⌘/Ctrl + wheel zooms (the scroll-first policy always zooms with the modifier)
        await gestures.wheel(rendered.view, { deltaY: -100, ctrlKey: true, x: 500, y: 300 });
        await flushFrames(2);
        expect(rendered.api.getSnapshot().space.camera.scale).toBeGreaterThan(1);

        // the selection handle and history
        rendered.handle.selection.all();
        expect(rendered.handle.selection.get()).toHaveLength(2);
        rendered.handle.selection.clear();
        expect(rendered.handle.selection.get()).toHaveLength(0);
        expect(rendered.handle.history.get().canUndo).toBe(false);

        await rendered.unmount();
        clock.restore();
    });

    it('a grab-mode drag orbits through the synthetic pointer events', async () => {
        const clock = installFrameClock();
        const rendered = await renderPlurid({
            planes,
            view: ['/one'],
            configuration: { space: { gestures: { disableMomentum: true, dragThreshold: 0 } } } as any,
        });
        rendered.handle.focus();
        await gestures.key(rendered.view, 'KeyG');
        expect(rendered.api.getSnapshot().ui.grabMode).toBe(true);

        await gestures.drag(rendered.view, { x: 100, y: 500 }, { x: 260, y: 500 }, { steps: 4 });
        await flushFrames(2);
        expect(rendered.api.getSnapshot().space.camera.yaw).toBeGreaterThan(5);

        await rendered.unmount();
        clock.restore();
    });
});
// #endregion module
