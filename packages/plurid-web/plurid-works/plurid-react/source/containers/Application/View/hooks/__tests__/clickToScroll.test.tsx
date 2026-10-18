/** @jest-environment jsdom */
// #region imports
import React, { act } from 'react';
import { PLURID_PUBSUB_TOPIC, PLURID_ATTRIBUTE_PLANE_ANCHOR } from '@plurid/plurid-data';
import { renderPlurid, installFrameClock, flushFrames, gestures } from '../../../../../testing';
import { usePluridPlane } from '~services/hooks/plane';
import actions from '~services/state/actions';
// #endregion imports

// #region module
const Content = () => {
    const { scrollSelected } = usePluridPlane();
    return <button data-content-selected={scrollSelected}>content</button>;
};
const planes = [
    { route: '/one', component: Content },
    { route: '/two', component: Content },
];
const configuration = {
    space: {
        gestures: { wheel: 'click-to-scroll' as const, wheelSmoothing: 1 },
        navigation: { motion: { duration: 0 } },
    },
};

const press = async (element: HTMLElement) =>
    act(async () => {
        const Pointer = (window as any).PointerEvent;
        element.dispatchEvent(
            new Pointer('pointerdown', {
                bubbles: true,
                cancelable: true,
                button: 0,
                buttons: 1,
                isPrimary: true,
            }),
        );
        element.dispatchEvent(
            new Pointer('pointerup', {
                bubbles: true,
                cancelable: true,
                button: 0,
                buttons: 0,
                isPrimary: true,
            }),
        );
        element.click();
    });
const wheel = async (element: HTMLElement, properties: WheelEventInit = {}) => {
    const event = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaY: -100,
        ...properties,
    });
    await act(async () => {
        element.dispatchEvent(event);
    });
    await flushFrames(3);
    return event;
};

const render = () =>
    renderPlurid({ planes, view: ['/one', '/two'], configuration: configuration as any });
const targets = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('[data-content-selected]'));
const camera = (rendered: Awaited<ReturnType<typeof render>>) =>
    rendered.api.getSnapshot().space.camera;

describe('click-to-scroll input ownership', () => {
    it('routes before native preview handlers; the activating click still performs its action', async () => {
        const clock = installFrameClock();
        const rendered = await render();
        const [one, two] = targets(rendered.container);
        const localWheel = jest.fn((event: Event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        const clicked = jest.fn();
        one.addEventListener('wheel', localWheel);
        one.addEventListener('click', clicked);
        const before = camera(rendered).scale;
        await wheel(one);
        expect(localWheel).not.toHaveBeenCalled();
        expect(camera(rendered).scale).toBeGreaterThan(before);

        await press(one);
        expect(clicked).toHaveBeenCalledTimes(1);
        expect(one.getAttribute('data-content-selected')).toBe('true');
        expect(
            one.closest('[data-plurid-plane]')?.getAttribute('data-plurid-scroll-selected'),
        ).toBe('true');
        expect(rendered.handle.selection.get()).toEqual([]);
        const selectedCamera = camera(rendered);
        await wheel(one);
        expect(localWheel).toHaveBeenCalledTimes(1);
        expect(camera(rendered)).toEqual(selectedCamera);

        await press(two);
        expect(one.getAttribute('data-content-selected')).toBe('false');
        expect(two.getAttribute('data-content-selected')).toBe('true');
        await rendered.unmount();
        clock.restore();
    });

    it('keeps a flick with its owner when it crosses selected, unselected, and empty surfaces', async () => {
        const clock = installFrameClock();
        const rendered = await render();
        const [one, two] = targets(rendered.container);
        const localWheel = jest.fn((event: Event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        one.addEventListener('wheel', localWheel);
        two.addEventListener('wheel', localWheel);
        await press(one);
        const before = camera(rendered);
        await wheel(one);
        await wheel(two);
        await wheel(rendered.view);
        await wheel(one);
        expect(localWheel).toHaveBeenCalledTimes(1);
        expect(camera(rendered)).toEqual(before);

        clock.advance(301);
        await wheel(two);
        const moving = camera(rendered).scale;
        await wheel(one);
        expect(camera(rendered).scale).toBeGreaterThan(moving);
        expect(localWheel).toHaveBeenCalledTimes(1);
        clock.advance(301);
        await wheel(one);
        expect(localWheel).toHaveBeenCalledTimes(2);
        await rendered.unmount();
        clock.restore();
    });

    it('contains non-scrollers and scroll boundaries; selected editable fields keep native scrolling', async () => {
        const clock = installFrameClock();
        const rendered = await render();
        const [one] = targets(rendered.container);
        await press(one);
        const before = camera(rendered);
        expect((await wheel(one)).defaultPrevented).toBe(true);
        const field = document.createElement('textarea');
        field.style.overflowY = 'auto';
        Object.defineProperties(field, {
            scrollHeight: { value: 400 },
            clientHeight: { value: 100 },
        });
        one.parentElement!.appendChild(field);
        await press(field);
        await act(async () => {
            field.focus();
        });
        expect((await wheel(field, { deltaY: 10 })).defaultPrevented).toBe(false);
        field.scrollTop = 300;
        expect((await wheel(field, { deltaY: 10 })).defaultPrevented).toBe(false);
        expect(camera(rendered)).toEqual(before);
        // A focused text field must not bypass a cleared scroll selection.
        await gestures.key(field, 'Escape');
        expect(rendered.api.getSnapshot().ui.scrollPlaneID).toBe('');
        expect((await wheel(field)).defaultPrevented).toBe(true);
        expect(camera(rendered).scale).toBeGreaterThan(before.scale);
        await rendered.unmount();
        clock.restore();
    });

    it('clears before host Escape handlers, ignores overlays, and supports the keyboard anchor', async () => {
        const clock = installFrameClock();
        const rendered = await render();
        const [one] = targets(rendered.container);
        await press(one);
        const host = (event: KeyboardEvent) => event.stopPropagation();
        rendered.container.addEventListener('keydown', host, true);
        await gestures.key(one, 'Escape');
        expect(rendered.api.getSnapshot().ui.scrollPlaneID).toBe('');
        rendered.container.removeEventListener('keydown', host, true);
        const anchor = rendered.container.querySelector<HTMLElement>(
            '[' + PLURID_ATTRIBUTE_PLANE_ANCHOR + ']',
        )!;
        await gestures.key(anchor, 'Enter');
        expect(one.getAttribute('data-content-selected')).toBe('true');
        const overlay = document.createElement('div');
        overlay.setAttribute('data-plurid-overlay', 'test');
        rendered.view.appendChild(overlay);
        expect((await wheel(overlay)).defaultPrevented).toBe(false);
        await gestures.key(overlay, 'Escape');
        expect(one.getAttribute('data-content-selected')).toBe('true');
        await press(rendered.view);
        expect(one.getAttribute('data-content-selected')).toBe('false');
        await rendered.unmount();
        clock.restore();
    });

    it('preserves explicit navigation overrides over an active interactive plane', async () => {
        const clock = installFrameClock();
        const rendered = await render();
        const [one] = targets(rendered.container);
        const localWheel = jest.fn((event: Event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        one.addEventListener('wheel', localWheel);
        await press(one);
        await wheel(one);
        const before = camera(rendered);
        await wheel(one, { deltaY: 5, ctrlKey: true });
        expect(camera(rendered).scale).toBeLessThan(before.scale);
        const yaw = camera(rendered).pitch;
        await wheel(one, { shiftKey: true });
        expect(camera(rendered).pitch).not.toBe(yaw);
        const pan = camera(rendered).offset.y;
        await wheel(one, { altKey: true });
        expect(camera(rendered).offset.y).not.toBe(pan);
        await act(async () => {
            rendered.api.store.dispatch(actions.ui.setUIGrabMode(true));
        });
        const grabbed = camera(rendered).scale;
        await wheel(one);
        expect(camera(rendered).scale).toBeGreaterThan(grabbed);
        await act(async () => {
            rendered.api.store.dispatch(actions.ui.setUIGrabMode(false));
            rendered.api.pubsub.publish({
                topic: PLURID_PUBSUB_TOPIC.CONFIGURATION,
                data: { space: { transformMode: 'SCALE' } },
            });
        });
        const scaled = camera(rendered).scale;
        await wheel(one);
        expect(camera(rendered).scale).toBeGreaterThan(scaled);
        expect(localWheel).toHaveBeenCalledTimes(1);
        await rendered.unmount();
        clock.restore();
    });

    it('restores legacy plane routing when toggled off and clears focus when its plane hides', async () => {
        const clock = installFrameClock();
        const rendered = await render();
        const [one] = targets(rendered.container);
        await press(one);
        const id = rendered.api.getSnapshot().ui.scrollPlaneID;
        await act(async () => {
            rendered.api.pubsub.publish({
                topic: PLURID_PUBSUB_TOPIC.CONFIGURATION,
                data: { space: { gestures: { wheel: 'plane' } } },
            });
        });
        expect(rendered.api.getSnapshot().ui.scrollPlaneID).toBe('');
        const before = camera(rendered);
        expect((await wheel(one)).defaultPrevented).toBe(true);
        expect(camera(rendered)).toEqual(before);
        await act(async () => {
            rendered.api.pubsub.publish({
                topic: PLURID_PUBSUB_TOPIC.CONFIGURATION,
                data: configuration,
            });
        });
        await press(one);
        expect(rendered.api.getSnapshot().ui.scrollPlaneID).toBe(id);
        await act(async () => {
            rendered.handle.tree.set(
                rendered.api
                    .getSnapshot()
                    .space.tree.map((plane: any) =>
                        plane.planeID === id ? { ...plane, show: false } : plane,
                    ),
            );
        });
        expect(rendered.api.getSnapshot().ui.scrollPlaneID).toBe('');
        await rendered.unmount();
        clock.restore();
    });

    it('programmatic docking activates exactly one plane and keeps that owner on reveal', async () => {
        const clock = installFrameClock();
        const rendered = await render();
        const [one, two] = targets(rendered.container);
        await press(one);
        const twoID = two.closest('[data-plurid-plane]')!.getAttribute('data-plurid-plane')!;
        await act(async () => {
            rendered.handle.camera.dock(twoID, { animate: false });
        });
        expect(rendered.container.querySelectorAll('[data-plurid-scroll-selected]')).toHaveLength(
            1,
        );
        expect(one.getAttribute('data-content-selected')).toBe('false');
        expect(two.getAttribute('data-content-selected')).toBe('true');
        expect(rendered.api.getSnapshot().ui.scrollPlaneID).toBe(twoID);
        await act(async () => {
            rendered.handle.camera.reveal({ animate: false });
        });
        expect(one.getAttribute('data-content-selected')).toBe('false');
        expect(two.getAttribute('data-content-selected')).toBe('true');
        await rendered.unmount();
        clock.restore();
    });

    it('hands docked pages their wheel immediately and leaves an external Quick Preview alone', async () => {
        const clock = installFrameClock();
        const rendered = await renderPlurid({
            planes,
            view: ['/one'],
            configuration: {
                ...configuration,
                space: { ...configuration.space, presentation: 'page' },
            } as any,
        });
        const [one] = targets(rendered.container);
        const localWheel = jest.fn((event: Event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        one.addEventListener('wheel', localWheel);
        await wheel(one);
        expect(localWheel).toHaveBeenCalledTimes(1);
        expect(one.getAttribute('data-content-selected')).toBe('true');
        const dialog = document.createElement('dialog');
        rendered.container.appendChild(dialog);
        dialog.addEventListener('wheel', localWheel);
        const before = camera(rendered);
        await wheel(dialog);
        await gestures.key(dialog, 'Escape');
        expect(localWheel).toHaveBeenCalledTimes(2);
        expect(camera(rendered)).toEqual(before);
        expect(one.getAttribute('data-content-selected')).toBe('true');
        await rendered.unmount();
        clock.restore();
    });
});
// #endregion module
