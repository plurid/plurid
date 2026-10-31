/** @jest-environment jsdom */
import React, { act } from 'react';
import { createPortal } from 'react-dom';
import { renderPlurid, installFrameClock } from '../../../../testing';
import type { PluridConfigurationSpaceGestures } from '@plurid/plurid-data';

const click = async (element: Element, init: MouseEventInit = { shiftKey: true }) => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
    await act(async () => { element.dispatchEvent(event); });
    return event;
};
const Content = () => <div>
    <span data-text>Selectable words</span>
    <input data-field />
    <a data-link href="#target">Link</a>
    <span data-consumed onClick={(event) => event.preventDefault()}>Host action</span>
    <div data-plurid-plane="nested"><span data-nested>Nested content</span></div>
    {createPortal(<span data-portaled>Overlay</span>, document.body)}
</div>;
const render = (selection?: PluridConfigurationSpaceGestures['selection']) => renderPlurid({
    planes: [{ route: '/one', component: Content }],
    view: ['/one'],
    configuration: { space: { gestures: { selection } } },
    renderPlaneControls: () => <div data-plurid-selection-handle style={{ height: 40 }}>
        <span data-title>Title</span><button data-tool>Tool</button>
    </div>,
});

describe('modifier selection ownership', () => {
    it.each(['shiftKey', 'ctrlKey', 'metaKey'])('keeps content native and toggles only title chrome with %s', async (modifier) => {
        const clock = installFrameClock();
        const app = await render();
        try {
            const init = { [modifier]: true };
            for (const selector of ['[data-text]', '[data-field]', '[data-link]', '[data-tool]', '[data-nested]', '[data-portaled]']) {
                expect((await click(document.querySelector(selector)!, init)).defaultPrevented).toBe(false);
                expect(app.handle.selection.get()).toEqual([]);
            }
            const title = app.container.querySelector('[data-title]')!;
            await click(title, init);
            expect(app.handle.selection.get()).toHaveLength(1);
            await click(title, init);
            expect(app.handle.selection.get()).toEqual([]);
        } finally {
            await app.unmount(); clock.restore();
        }
    });

    it.each([{ target: 'none' as const }, { modifiers: [] }, { modifiers: ['meta' as const] }])('can disable the Shift gesture without disabling programmatic selection: %j', async (selection) => {
        const clock = installFrameClock();
        const app = await render(selection);
        try {
            await click(app.container.querySelector('[data-title]')!);
            expect(app.handle.selection.get()).toEqual([]);
            const id = app.api.getSnapshot().space.tree[0].planeID;
            app.handle.selection.set([id]);
            expect(app.handle.selection.get()).toEqual([id]);
        } finally { await app.unmount(); clock.restore(); }
    });

    it('supports whole-plane opt-in while respecting controls, consumed events, nested planes and portals', async () => {
        const clock = installFrameClock();
        const app = await render({ target: 'plane' });
        try {
            for (const selector of ['[data-field]', '[data-link]', '[data-tool]', '[data-consumed]', '[data-nested]', '[data-portaled]']) {
                await click(document.querySelector(selector)!);
                expect(app.handle.selection.get()).toEqual([]);
            }
            await click(app.container.querySelector('[data-text]')!);
            expect(app.handle.selection.get()).toHaveLength(1);
        } finally { await app.unmount(); clock.restore(); }
    });
});
