/**
 * @jest-environment jsdom
 */
/**
 * THE BOOKMARKS DRAWER: name the view and save it, every saved view listed with a computed picture
 * of where it looks, a click travelling there, a rename keeping the row in its place.
 */
import React, { act } from 'react';

import {
    renderPlurid,
} from '../../../../../../../../../testing';



const Page = () => <div>page</div>;

const MORE = '[data-plurid-control="toolbar-more"]';
const NAME = '[data-plurid-control="bookmark-name"]';
const SAVE = '[data-plurid-control="bookmark-save"]';
const GO = '[data-plurid-control="bookmark-go"]';
const RENAME = '[data-plurid-control="bookmark-rename"]';
const RENAME_INPUT = '[data-plurid-control="bookmark-rename-input"]';
const REMOVE = '[data-plurid-control="bookmark-remove"]';
const ROW = '[data-plurid-bookmark]';

const click = async (element: Element | null) => {
    expect(element).toBeTruthy();
    await act(async () => {
        (element as HTMLElement).click();
    });
};

const fill = async (input: Element | null, value: string) => {
    expect(input).toBeTruthy();
    await act(async () => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
        setter.call(input, value);
        (input as HTMLInputElement).dispatchEvent(new Event('input', { bubbles: true }));
    });
};

const press = async (element: Element | null, key: string) => {
    await act(async () => {
        (element as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true }));
    });
};

/** The application with the Bookmarks drawer open in the toolbar's More menu. */
const openDrawer = async (presets?: Record<string, string>) => {
    const rendered = await renderPlurid({
        planes: [{ route: '/a', component: Page }, { route: '/b', component: Page }],
        view: ['/a', '/b'],
        configuration: {
            space: {
                navigation: {
                    motion: { duration: 0 },
                    ...(presets ? { presets } : {}),
                },
            },
            elements: {
                toolbar: { toggledDrawers: ['BOOKMARKS'] },
            },
        } as any,
    });
    await click(rendered.container.querySelector(MORE));
    return rendered;
};


describe('the bookmarks drawer', () => {
    it('saves the view under a name, lists it with a picture, and travels back to it', async () => {
        const rendered = await openDrawer();
        const { container, api } = rendered;

        // home is a row from the start, with a thumbnail of the space
        expect(container.querySelectorAll(ROW)).toHaveLength(1);
        expect(container.querySelector('[data-plurid-bookmark="home"]')).toBeTruthy();
        expect(container.querySelector('[data-plurid-viewpoint-thumb]')).toBeTruthy();
        expect(container.textContent).toContain('no bookmarks yet');

        await fill(container.querySelector(NAME), 'wide');
        await click(container.querySelector(SAVE));

        expect(Object.keys(api.getSnapshot().space.bookmarks)).toEqual(['wide']);
        expect(container.querySelectorAll(ROW)).toHaveLength(2);
        expect(container.textContent).not.toContain('no bookmarks yet');
        const row = container.querySelector('[data-plurid-bookmark="wide"]')!;
        // the picture is computed from the live tree: a dot per shown plane, the saved eye's ring
        expect(row.querySelectorAll('[data-plurid-thumb-plane]').length).toBe(2);
        expect(row.querySelector('[data-plurid-thumb-look]')).toBeTruthy();

        // the camera moves away, and the row brings it back
        const saved = api.getSnapshot().space.camera;
        await act(async () => {
            rendered.handle.camera.moveBy({ yaw: 30, pitch: 10 });
        });
        expect(api.getSnapshot().space.camera.yaw).not.toBeCloseTo(saved.yaw, 3);

        await click(row.querySelector(GO));
        expect(api.getSnapshot().space.camera.yaw).toBeCloseTo(saved.yaw, 3);
        await rendered.unmount();
    });

    it('renames in place (Escape abandons it) and removes; the button says what a taken name will do', async () => {
        const rendered = await openDrawer();
        const { container, api } = rendered;

        for (const name of ['one', 'two']) {
            await fill(container.querySelector(NAME), name);
            await click(container.querySelector(SAVE));
        }
        expect(Object.keys(api.getSnapshot().space.bookmarks)).toEqual(['one', 'two']);
        // the field says it will overwrite, not add
        await fill(container.querySelector(NAME), 'one');
        expect(container.querySelector(SAVE)!.textContent).toContain('update');
        await fill(container.querySelector(NAME), '');

        // Escape leaves the name alone
        const first = () => container.querySelector('[data-plurid-bookmark="one"]')!;
        await click(first().querySelector(RENAME));
        await fill(container.querySelector(RENAME_INPUT), 'abandoned');
        await press(container.querySelector(RENAME_INPUT), 'Escape');
        expect(Object.keys(api.getSnapshot().space.bookmarks)).toEqual(['one', 'two']);

        // Enter commits it, and the row keeps its place
        await click(first().querySelector(RENAME));
        await fill(container.querySelector(RENAME_INPUT), 'first');
        await press(container.querySelector(RENAME_INPUT), 'Enter');
        expect(Object.keys(api.getSnapshot().space.bookmarks)).toEqual(['first', 'two']);

        await click(container.querySelector('[data-plurid-bookmark="first"]')!.querySelector(REMOVE));
        expect(Object.keys(api.getSnapshot().space.bookmarks)).toEqual(['two']);
        await rendered.unmount();
    });

    it('a preset is listed and can be visited, never edited', async () => {
        const rendered = await openDrawer({ overview: 'v2:0:0:0.5:100:200:0:0:0:0:2000' });
        const { container } = rendered;

        const preset = container.querySelector('[data-plurid-bookmark-source="preset"]');
        expect(preset).toBeTruthy();
        expect(preset!.textContent).toContain('overview');
        expect(preset!.querySelector(GO)).toBeTruthy();
        expect(preset!.querySelector(RENAME)).toBeNull();
        expect(preset!.querySelector(REMOVE)).toBeNull();
        await rendered.unmount();
    });
});
