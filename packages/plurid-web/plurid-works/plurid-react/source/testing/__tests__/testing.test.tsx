/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, {
        act,
    } from 'react';
    // #endregion libraries


    // #region external
    import {
        PLURID_ATTRIBUTE_PLANE_ANCHOR,
    } from '@plurid/plurid-data';

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

        // a wheel zooms at the cursor (scroll-first: nothing under it scrolls); Ctrl + a notch is the browser's now
        await gestures.wheel(rendered.view, { deltaY: -100, x: 500, y: 300 });
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

    it('Enter on a plane\'s focus anchor frames THAT plane, whatever plane was active', async () => {
        installFrameClock();
        const rendered = await renderPlurid({
            planes,
            view: ['/one', '/two'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        });
        const [one, two] = rendered.api.getSnapshot().space.tree.map((plane: any) => plane.planeID);
        const anchor = document.querySelector('[' + PLURID_ATTRIBUTE_PLANE_ANCHOR + '="' + two + '"]') as HTMLElement | null;
        expect(anchor).toBeTruthy();
        // the DOM id is a digest, never the route; the attribute names the plane
        expect(anchor!.id).toMatch(/^plurid-[a-z0-9]+-focus$/);
        expect(anchor!.closest('[data-plurid-plane]')!.id).toMatch(/^plurid-[a-z0-9]+$/);

        anchor!.focus();
        await gestures.key(anchor!, 'Enter');
        await flushFrames(2);
        expect(rendered.api.getSnapshot().space.activePlaneID).toBe(two);

        // and from the view, the active one stays what it was
        await gestures.key(rendered.view, 'Enter');
        await flushFrames(2);
        expect(rendered.api.getSnapshot().space.activePlaneID).toBe(two);
        expect(one).not.toBe(two);

        await rendered.unmount();
    });

    it('a mode is named: on the view, in a badge, and in the live region; Escape leaves it and says so', async () => {
        installFrameClock();
        const rendered = await renderPlurid({
            planes,
            view: ['/one'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        });
        const view = rendered.view;
        const badge = () => document.querySelector('[data-plurid-entity="PluridModeBadge"]');
        const announced = () => document.querySelector('[data-plurid-entity="PluridLiveRegion"]')?.textContent || '';
        expect(view.getAttribute('data-plurid-mode')).toBeNull();
        expect(badge()).toBeNull();

        await gestures.key(view, 'KeyR');
        await flushFrames(1);
        expect(rendered.api.getSnapshot().configuration.space.transformMode).toBe('ROTATION');
        expect(view.getAttribute('data-plurid-mode')).toBe('rotate');
        expect(badge()?.textContent).toBe('rotate mode' + 'esc to leave');
        expect(announced()).toBe('rotate mode');

        await gestures.key(view, 'Escape');
        await flushFrames(1);
        expect(rendered.api.getSnapshot().configuration.space.transformMode).toBe('ALL');
        expect(view.getAttribute('data-plurid-mode')).toBeNull();
        expect(badge()).toBeNull();
        expect(announced()).toBe('mode off');

        // R twice: in and out again
        await gestures.key(view, 'KeyR');
        await gestures.key(view, 'KeyR');
        await flushFrames(1);
        expect(rendered.api.getSnapshot().configuration.space.transformMode).toBe('ALL');

        await rendered.unmount();
    });

    it('a second finger during a marquee takes the band off before it pinches', async () => {
        installFrameClock();
        const rendered = await renderPlurid({
            planes,
            view: ['/one'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        });
        const view = rendered.view;
        const Pointer = (window as any).PointerEvent;
        const pointer = (type: string, x: number, y: number, extra: Record<string, unknown> = {}) => new Pointer(type, {
            bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0,
            buttons: type === 'pointerup' ? 0 : 1, pointerId: 1, pointerType: 'mouse', isPrimary: true, ...extra,
        });
        const marquee = () => rendered.api.getSnapshot().ui.marquee;

        // a modifier press on empty space, dragged past the threshold: the rubber band is up
        await act(async () => { view.dispatchEvent(pointer('pointerdown', 100, 100, { metaKey: true })); });
        await act(async () => { view.dispatchEvent(pointer('pointermove', 140, 130, { metaKey: true })); });
        expect(marquee()).not.toBeNull();

        // a second finger: the two are a pinch from here, and the band comes off at once
        await act(async () => { view.dispatchEvent(pointer('pointerdown', 300, 300, { pointerId: 2, pointerType: 'touch', isPrimary: false })); });
        expect(marquee()).toBeNull();

        await act(async () => {
            view.dispatchEvent(pointer('pointerup', 140, 130, { buttons: 0 }));
            view.dispatchEvent(pointer('pointerup', 300, 300, { pointerId: 2, pointerType: 'touch', buttons: 0 }));
        });
        expect(marquee()).toBeNull();

        await rendered.unmount();
    });

    it('the chrome context keeps its identity through a camera move: a slot never re-renders per frame', async () => {
        installFrameClock();
        const contexts: unknown[] = [];
        const rendered = await renderPlurid({
            planes,
            view: ['/one'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
            renderToolbar: ((context: unknown) => { contexts.push(context); return null; }) as any,
        });
        const seen = new Set(contexts);
        expect(seen.size).toBeGreaterThan(0);

        rendered.handle.camera.moveBy({ yaw: 30, pitch: -10 });
        await flushFrames(2);
        rendered.handle.camera.moveBy({ yaw: 10 });
        await flushFrames(2);
        expect(new Set(contexts).size).toBe(seen.size);
        expect((contexts[0] as any).camera).toBeUndefined();

        await rendered.unmount();
    });

    it('the view registers ONE window resize listener, and it is debounced', async () => {
        const registered: EventListenerOrEventListenerObject[] = [];
        const original = window.addEventListener;
        window.addEventListener = ((type: string, listener: any, options?: any) => {
            if (type === 'resize') {
                registered.push(listener);
            }
            return original.call(window, type, listener, options);
        }) as any;
        try {
            const rendered = await renderPlurid({ planes, view: ['/one'] });
            expect(registered).toHaveLength(1);
            await rendered.unmount();
        } finally {
            window.addEventListener = original;
        }
    });

    it('the focus anchor acts: Space selects the plane, and the plane wears the ring while the anchor has the keyboard', async () => {
        installFrameClock();
        const rendered = await renderPlurid({ planes, view: ['/one', '/two'] });
        const [one] = rendered.api.getSnapshot().space.tree.map((plane: any) => plane.planeID);
        const anchor = document.querySelector('[' + PLURID_ATTRIBUTE_PLANE_ANCHOR + '="' + one + '"]') as HTMLElement;
        const planeElement = anchor.closest('[data-plurid-plane]') as HTMLElement;

        expect(planeElement.getAttribute('data-plurid-focus')).toBeNull();
        await act(async () => { anchor.focus(); });
        expect(planeElement.getAttribute('data-plurid-focus')).toBe('true');

        await gestures.key(anchor, 'Space', { key: ' ' });
        expect(rendered.handle.selection.get()).toEqual([one]);
        expect(anchor.getAttribute('aria-pressed')).toBe('true');
        await gestures.key(anchor, 'Space', { key: ' ' });
        expect(rendered.handle.selection.get()).toEqual([]);

        await act(async () => { anchor.blur(); });
        expect(planeElement.getAttribute('data-plurid-focus')).toBeNull();

        await rendered.unmount();
    });

    it('the empty state speaks the space\'s language', async () => {
        const rendered = await renderPlurid({
            planes,
            view: [],
            configuration: { global: { language: 'french' } } as any,
        });
        const empty = document.querySelector('[data-plurid-entity="PluridEmpty"]');
        expect(empty?.textContent).toBe('aucun plan dans cet espace');
        await rendered.unmount();
    });
});
// #endregion module
