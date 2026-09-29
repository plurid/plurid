/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, { act } from 'react';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
    } from '../../../../testing';

    import actions from '~services/state/actions';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE CHROME'S KEYS ARE THE CHROME'S (2026-09-29). The view listens on its own element and runs
 * before React's handlers, so its bindings took Enter and Space from the engine's own buttons (Enter
 * on the toolbar framed the plane the pointer had last crossed; Space armed the grab) and every key
 * from inside the modal shortcuts dialog (R switched to rotate mode behind it; the arrows could not
 * scroll it). A keyboard reader could press none of the chrome.
 */
const Page = () => <div>page</div>;

const keydown = (
    target: Element,
    key: string,
    code = key,
) => {
    const event = new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
};

const render = () => renderPlurid({
    planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }],
    view: ['/a', '/b'],
    configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
});


describe('keys on the chrome', () => {
    it('Enter and Space press a toolbar button; they do not frame or grab', async () => {
        const rendered = await render();
        const [a] = rendered.api.getSnapshot().space.tree.map((plane: any) => plane.planeID);
        await act(async () => {
            rendered.api.store.dispatch(actions.space.setSpaceField({ field: 'activePlaneID', value: a }) as any);
        });
        const camera = rendered.api.getSnapshot().space.camera;
        const more = rendered.container.querySelector('[data-plurid-control="toolbar-more"]') as HTMLElement;
        expect(more).not.toBeNull();

        let enter: KeyboardEvent | undefined;
        await act(async () => {
            enter = keydown(more, 'Enter');
        });
        expect(enter!.defaultPrevented).toBe(false);
        expect(rendered.api.getSnapshot().space.camera).toEqual(camera);

        let space: KeyboardEvent | undefined;
        await act(async () => {
            space = keydown(more, ' ', 'Space');
        });
        expect(space!.defaultPrevented).toBe(false);
        expect(rendered.api.getSnapshot().ui.grabHold).toBeFalsy();
        await rendered.unmount();
    });

    it('inside the shortcuts dialog every key is the dialog\'s', async () => {
        const rendered = await render();
        const trigger = rendered.container.querySelector('[data-plurid-control="shortcuts"]') as HTMLElement;
        expect(trigger).not.toBeNull();
        await act(async () => {
            trigger.click();
        });
        const dialog = rendered.container.querySelector('[data-plurid-overlay="shortcuts"]') as HTMLElement;
        expect(dialog).not.toBeNull();
        const inside = dialog.querySelector('button, [tabindex]') as HTMLElement ?? dialog;
        const mode = rendered.api.getSnapshot().configuration.space.transformMode;

        let arrow: KeyboardEvent | undefined;
        await act(async () => {
            keydown(inside, 'r', 'KeyR');
            arrow = keydown(inside, 'ArrowDown');
        });
        expect(rendered.api.getSnapshot().configuration.space.transformMode).toBe(mode);
        expect(arrow!.defaultPrevented).toBe(false);
        await rendered.unmount();
    });

    it('a plane\'s focus anchor is the space\'s: Enter on it still frames the plane', async () => {
        const rendered = await render();
        const anchor = rendered.container.querySelector('[data-plurid-plane-anchor]') as HTMLElement;
        expect(anchor).not.toBeNull();
        let enter: KeyboardEvent | undefined;
        await act(async () => {
            enter = keydown(anchor, 'Enter');
        });
        expect(enter!.defaultPrevented).toBe(true);
        expect(rendered.api.getSnapshot().space.activePlaneID).toBe(anchor.getAttribute('data-plurid-plane-anchor'));
        await rendered.unmount();
    });
});
// #endregion module
