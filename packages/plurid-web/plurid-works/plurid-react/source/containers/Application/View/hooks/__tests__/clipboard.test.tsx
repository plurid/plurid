/**
 * @jest-environment jsdom
 */
/**
 * COPY / CUT / PASTE OF PLANES on the browser's own clipboard events: the selection leaves as text
 * and comes back as planes — in this space, or in another application on the same page, which is
 * what "across instances" means when two spaces share a document.
 */
import React, { act } from 'react';

import {
    renderPlurid,
} from '../../../../../testing';

import {
    FRAGMENT_MARKER,
} from '~services/logic/arrangement/fragment';



const Page = () => <div>page</div>;

/** jsdom has no `ClipboardEvent`: the handler reads `clipboardData` and nothing else of it. */
const clipboardEvent = (
    type: 'copy' | 'cut' | 'paste',
    data: Map<string, string>,
) => {
    const event = new Event(type, { bubbles: true, cancelable: true }) as Event & {
        clipboardData: { getData: (format: string) => string; setData: (format: string, value: string) => void };
    };
    event.clipboardData = {
        getData: (format: string) => data.get(format) ?? '',
        setData: (format: string, value: string) => { data.set(format, value); },
    };
    return event;
};

const clipboard = new Map<string, string>();

const press = async (
    view: HTMLElement,
    type: 'copy' | 'cut' | 'paste',
) => {
    await act(async () => {
        view.focus();
        view.dispatchEvent(clipboardEvent(type, clipboard));
    });
};

const render = (
    routes: string[],
) => renderPlurid({
    planes: routes.map((route) => ({ route, component: Page })),
    view: routes,
    configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
});

const roots = (api: any) => api.getSnapshot().space.tree.filter((plane: any) => plane.show !== false);


describe('the clipboard', () => {
    beforeEach(() => clipboard.clear());

    it('copies the selection as a fragment and pastes it back as new planes', async () => {
        const rendered = await render(['/a', '/b']);
        const { api, view } = rendered;

        await act(async () => {
            rendered.handle.selection.set([api.getSnapshot().space.tree[0].planeID]);
        });
        await press(view, 'copy');

        const text = clipboard.get('text/plain')!;
        expect(text).toContain(FRAGMENT_MARKER);
        // the PATH is the identity: the host it was copied on is nowhere in it
        expect(text).toContain('"path":"/a"');

        await press(view, 'paste');
        const tree = roots(api);
        expect(tree).toHaveLength(3);
        expect(tree[2].route).toBe(tree[0].route);
        expect(tree[2].planeID).not.toBe(tree[0].planeID);
        // the paste is the selection, placed away from what it landed on
        expect(api.getSnapshot().space.selectedPlaneIDs).toEqual([tree[2].planeID]);
        expect(tree[2].location.translateX).not.toBe(tree[0].location.translateX);

        // and a second paste does not land on the first
        await press(view, 'paste');
        const after = roots(api);
        expect(after).toHaveLength(4);
        expect(after[3].location.translateX).not.toBe(after[2].location.translateX);
        await rendered.unmount();
    });

    it('a cut copies and then closes what it copied — one undo brings it back', async () => {
        const rendered = await render(['/a', '/b']);
        const { api, view } = rendered;
        const first = api.getSnapshot().space.tree[0].planeID;

        await act(async () => {
            rendered.handle.selection.set([first]);
        });
        await press(view, 'cut');
        expect(clipboard.get('text/plain')).toContain(FRAGMENT_MARKER);
        expect(roots(api)).toHaveLength(1);

        await act(async () => {
            rendered.handle.history.undo();
        });
        expect(roots(api)).toHaveLength(2);
        await rendered.unmount();
    });

    it('a paste into ANOTHER application keeps what it registers and drops the rest, by name', async () => {
        const source = await render(['/a', '/b']);
        await act(async () => {
            source.handle.selection.all();
        });
        await press(source.view, 'copy');
        const text = clipboard.get('text/plain')!;
        await source.unmount();

        // a second application that knows only one of the two routes
        const target = await render(['/a']);
        await act(async () => {
            target.handle.selection.paste(text);
        });
        // `/b` is not a plane here: one plane landed, and the tree still holds its own
        const tree = roots(target.api);
        expect(tree).toHaveLength(2);
        expect(tree[1].route).toBe(tree[0].route);
        await target.unmount();
    });

    it('text that is not a fragment does nothing, and a copy with no selection leaves the clipboard alone', async () => {
        const rendered = await render(['/a', '/b']);
        const { api, view } = rendered;

        clipboard.set('text/plain', 'an ordinary paragraph');
        await press(view, 'paste');
        expect(roots(api)).toHaveLength(2);

        await act(async () => {
            rendered.handle.selection.clear();
        });
        await press(view, 'copy');
        expect(clipboard.get('text/plain')).toBe('an ordinary paragraph');
        await rendered.unmount();
    });
});
