/**
 * @jest-environment jsdom
 */
/**
 * THE COMMAND PALETTE: ⌘/Ctrl+K opens it, typing filters the rows, Enter runs the selected one
 * through the same code its key press runs, Escape closes it and gives the focus back.
 */
import React, { act } from 'react';

import {
    renderPlurid,
} from '../../../../testing';



const Page = () => <div>page</div>;
const PALETTE = '[data-plurid-entity="PluridPalette"]';
const ROW = '[data-plurid-control="palette-row"]';
const INPUT = '[data-plurid-control="palette-input"]';

/** ⌘K on the view: the engine's keydown listener lives there. */
const open = async (rendered: { container: HTMLElement; view: HTMLElement }) => {
    await act(async () => {
        rendered.view.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', metaKey: true, bubbles: true, cancelable: true }));
    });
    return rendered.container.querySelector(PALETTE);
};

const type = async (container: HTMLElement, value: string) => {
    const input = container.querySelector(INPUT) as HTMLInputElement;
    await act(async () => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
        setter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    return input;
};

const press = async (element: Element, key: string) => {
    await act(async () => {
        element.dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true }));
    });
};

describe('the command palette', () => {
    it('opens on the shortcut, filters as you type, runs a command on Enter and closes on Escape', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }],
            view: ['/a', '/b'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        });
        const { container, api } = rendered;
        expect(container.querySelector(PALETTE)).toBeNull();

        expect(await open(rendered)).toBeTruthy();
        expect(api.getSnapshot().ui.paletteVisible).toBe(true);
        const all = container.querySelectorAll(ROW).length;
        expect(all).toBeGreaterThan(5);
        // every shown plane is a destination
        expect(container.textContent).toContain('Go to the plane /a');

        const input = await type(container, 'select');
        expect(container.querySelectorAll(ROW).length).toBeLessThan(all);
        expect(container.querySelector(ROW)!.textContent).toContain('Select every');

        // Enter runs the row: the same action the key press dispatches
        await press(input, 'Enter');
        expect(api.getSnapshot().space.selectedPlaneIDs.length).toBe(2);
        // running a row closes the palette
        expect(container.querySelector(PALETTE)).toBeNull();

        // Escape closes it without running anything
        await open(rendered);
        const again = container.querySelector(INPUT)!;
        await press(again, 'Escape');
        expect(container.querySelector(PALETTE)).toBeNull();
        rendered.unmount();
    });

    it('the arrows walk the list; a plane row frames its plane', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }],
            view: ['/a', '/b'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        });
        const { container, api } = rendered;
        const before = api.getSnapshot().space.camera;
        expect(await open(rendered)).toBeTruthy();
        const input = await type(container, 'plane /b');
        const first = container.querySelector(ROW)!;
        expect(first.getAttribute('data-plurid-palette-selected')).toBe('true');
        await press(input, 'ArrowDown');
        // one row matches: the walk wraps back onto it
        expect(container.querySelector(ROW)!.getAttribute('data-plurid-palette-selected')).toBe('true');
        await press(input, 'Enter');
        expect(api.getSnapshot().space.camera).not.toEqual(before);
        rendered.unmount();
    });

    it('is not rendered when the chrome is off, and the shortcut still works for a host', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }],
            view: ['/a'],
            configuration: { elements: { palette: { show: false } }, space: { navigation: { motion: { duration: 0 } } } } as any,
        });
        expect(await open(rendered)).toBeNull();
        // the state still carries the intent: a host's own palette reads it
        expect(rendered.api.getSnapshot().ui.paletteVisible).toBe(true);
        rendered.unmount();
    });
});
