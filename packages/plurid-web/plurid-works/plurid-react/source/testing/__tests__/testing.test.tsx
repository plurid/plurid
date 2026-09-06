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
        // G arms one grab: the release ended it
        expect(rendered.api.getSnapshot().ui.grabMode).toBe(false);

        await rendered.unmount();
        clock.restore();
    });

    it('in grab mode a press on plane content is the space\'s: its default is prevented (no native selection starts); off grab mode the page keeps it', async () => {
        const clock = installFrameClock();
        const rendered = await renderPlurid({
            planes,
            view: ['/one'],
            configuration: { space: { gestures: { disableMomentum: true } } },
        });
        const content = rendered.container.querySelector('[data-plurid-entity="PluridPlaneContent"]') as HTMLElement;
        const press = () => {
            const event = new (window as any).PointerEvent('pointerdown', {
                bubbles: true, cancelable: true, clientX: 200, clientY: 200, button: 0, buttons: 1, pointerId: 1, pointerType: 'mouse', isPrimary: true,
            });
            content.dispatchEvent(event);
            const prevented = event.defaultPrevented;
            content.dispatchEvent(new (window as any).PointerEvent('pointerup', { bubbles: true, cancelable: true, clientX: 200, clientY: 200, button: 0, buttons: 0, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
            return prevented;
        };
        // planes are pages: the press is the page's
        expect(press()).toBe(false);
        expect(rendered.view.hasAttribute('data-plurid-navigating')).toBe(false);

        rendered.handle.focus();
        await gestures.key(rendered.view, 'KeyG');
        expect(rendered.api.getSnapshot().ui.grabMode).toBe(true);
        expect(rendered.view.getAttribute('data-plurid-navigating')).toBe('grab');
        expect(press()).toBe(true);

        await gestures.key(rendered.view, 'Escape');
        expect(rendered.api.getSnapshot().ui.grabMode).toBe(false);
        expect(press()).toBe(false);

        // a press on the EMPTY space is the engine's (an orbit): prevented too, so a drag that
        // crosses a page never selects its text
        const empty = new (window as any).PointerEvent('pointerdown', {
            bubbles: true, cancelable: true, clientX: 20, clientY: 20, button: 0, buttons: 1, pointerId: 2, pointerType: 'mouse', isPrimary: true,
        });
        rendered.view.dispatchEvent(empty);
        expect(empty.defaultPrevented).toBe(true);
        rendered.view.dispatchEvent(new (window as any).PointerEvent('pointerup', { bubbles: true, cancelable: true, clientX: 20, clientY: 20, button: 0, buttons: 0, pointerId: 2, pointerType: 'mouse', isPrimary: true }));

        await rendered.unmount();
        clock.restore();
    });
});
// #endregion module
