/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, {
        act,
    } from 'react';
    import {
        hydrateRoot,
    } from 'react-dom/client';
    import type {
        Root,
    } from 'react-dom/client';
    import {
        renderToString,
    } from 'react-dom/server';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
        gestures,
        flushFrames,
        installFrameClock,
        pinned,
    } from '../../../../testing';
    import type {
        RenderedPlurid,
    } from '../../../../testing';
    import {
        installPointerEvents,
        installMatchMedia,
    } from '../../../../testing';
    import PluridApplication from '~containers/Application';
    import PluridProvider from '~containers/Provider';
    import type {
        PluridApplicationHandle,
    } from '~containers/Application/handle';
    // #endregion external
// #endregion imports



// #region module
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let mounts = 0;
let unmounts = 0;
/** Whether the content was in the document when its first layout effect measured it. */
let connectedAtMount: boolean[] = [];

/** Content with state of its own: a count, a field, and a mount counter. */
const Counter = () => {
    const [count, setCount] = React.useState(0);
    const self = React.useRef<HTMLDivElement>(null);
    React.useLayoutEffect(() => {
        connectedAtMount.push(!!self.current?.isConnected);
    }, []);
    React.useEffect(() => {
        mounts += 1;
        return () => {
            unmounts += 1;
        };
    }, []);
    return (
        <div ref={self} style={{ height: 200 }}>
            <button
                type="button"
                data-counter
                onClick={() => setCount((value) => value + 1)}
            >
                {count}
            </button>
            <input data-field />
        </div>
    );
};

const planes = [
    { route: '/a', component: Counter },
    { route: '/b', component: () => <div style={{ height: 200 }}>b</div> },
];

const render = async (): Promise<RenderedPlurid & { a: string }> => {
    mounts = 0;
    unmounts = 0;
    connectedAtMount = [];
    const rendered = await renderPlurid({
        planes,
        view: ['/a', '/b'],
        configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
    });
    await flushFrames(2);
    const a = rendered.handle.tree.get()[0].planeID;
    return { ...rendered, a };
};

const click = async (
    element: Element,
) => {
    await act(async () => {
        (element as HTMLElement).click();
    });
};


describe('a pinned plane', () => {
    it('checks a parameterized policy for query, open, restore and live revocation without remounting', async () => {
        mounts = 0;
        unmounts = 0;
        let allowed = true;
        const rendered = await renderPlurid({
            planes: [{ route: '/items/:id', component: Counter, pinnable: ({ parameters }) => allowed && parameters.id === 'note' }],
            view: ['/items/note', '/items/browser'],
            configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
        });
        const { handle, container } = rendered;
        const [note, browser] = handle.tree.get();
        expect(handle.planes.pinnable(note.planeID)).toBe(true);
        expect(handle.planes.pinnable(browser.planeID)).toBe(false);
        expect(handle.planes.open('/items/browser')).toBeUndefined();
        const counter = container.querySelector(`[data-plurid-plane="${note.planeID}"] [data-counter]`)!;
        await click(counter);
        await act(async () => { expect(handle.planes.pin(note.planeID)).toBe(true); });
        const saved = handle.tree.get();
        expect(pinned.frame(container, note.planeID)?.contains(counter)).toBe(true);
        const count = mounts;
        allowed = false;
        await act(async () => {
            rendered.api.store.dispatch({ type: 'space/restoreArrangement', payload: { tree: saved, links: [] } });
        });
        expect(handle.planes.pinnable(note.planeID)).toBe(false);
        expect(pinned.frame(container, note.planeID)).toBeNull();
        expect(container.querySelector(`[data-plurid-plane="${note.planeID}"] [data-counter]`)).toBe(counter);
        expect(counter.textContent).toBe('1');
        expect(mounts).toBe(count);
        expect(unmounts).toBe(0);
        allowed = true;
        await act(async () => { handle.tree.close(note.planeID); });
        expect(handle.planes.pinnable(note.planeID)).toBe(false);
        await rendered.unmount();
    });

    it('PIN AND PLACE KEEP THE CONTENT: the same DOM nodes, the same React state, no remount', async () => {
        const rendered = await render();
        const { container, handle, a } = rendered;
        const counter = container.querySelector(`[data-plurid-plane="${a}"] [data-counter]`) as HTMLElement;
        const field = container.querySelector(`[data-plurid-plane="${a}"] [data-field]`) as HTMLInputElement;
        await click(counter);
        field.value = 'typed';
        const host = pinned.host(container, a)!;
        expect(host).toBeTruthy();
        expect(pinned.where(container, a)).toBe('space');
        expect(mounts).toBe(1);
        // the host was in the document before the content's first layout effect measured it
        expect(connectedAtMount).toEqual([true]);

        await act(async () => {
            expect(handle.planes.pin(a)).toBe(true);
        });
        const frame = pinned.frame(container, a)!;
        expect(frame).toBeTruthy();
        expect(pinned.where(container, a)).toBe('pinned');
        expect(frame.contains(counter)).toBe(true);
        expect(frame.contains(host)).toBe(true);
        expect(counter.textContent).toBe('1');
        expect(field.value).toBe('typed');
        expect([mounts, unmounts]).toEqual([1, 0]);
        // the world shell stays, lifted: unpainted, inert, its content gone to the frame
        const shell = container.querySelector(`[data-plurid-plane="${a}"]`) as HTMLElement;
        expect(shell.getAttribute('data-plurid-lifted')).toBe('true');
        expect(shell.hasAttribute('inert')).toBe(true);
        expect(shell.style.visibility).toBe('hidden');
        expect(shell.contains(counter)).toBe(false);
        // the content works where it is
        await click(counter);
        expect(counter.textContent).toBe('2');

        let result: string | undefined;
        await act(async () => {
            result = await handle.planes.place(a);
        });
        expect(result).toBe('placed');
        expect(pinned.frame(container, a)).toBeNull();
        expect(pinned.where(container, a)).toBe('space');
        expect(pinned.host(container, a)).toBe(host);
        expect(shell.contains(counter)).toBe(true);
        expect(counter.textContent).toBe('2');
        expect(field.value).toBe('typed');
        expect([mounts, unmounts]).toEqual([1, 0]);
        expect(shell.getAttribute('data-plurid-lifted')).toBeNull();
        // hand-sized to the frame it left
        const placed = handle.tree.get()[0];
        expect(placed).toMatchObject({ sizeMode: 'manual', free: true, manuallyPositioned: true });
        await rendered.unmount();
    });

    it('collapses to its title bar and expands, from its own bar, the content kept underneath', async () => {
        const rendered = await render();
        const { container, handle, a } = rendered;
        await act(async () => {
            handle.planes.pin(a, { x: 20, y: 20, width: 360, height: 300 });
        });
        const frame = pinned.frame(container, a)!;
        expect(frame.style.height).toBe('300px');
        await click(frame.querySelector('[data-plurid-control="pinned-collapse"]')!);
        expect(frame.getAttribute('data-plurid-collapsed')).toBe('true');
        expect(frame.style.height).toBe('56px');
        expect(frame.querySelector('[data-plurid-pinned-content]')!.getAttribute('aria-hidden')).toBe('true');
        expect(handle.planes.pinned()[0].collapsed).toBe(true);
        expect(frame.contains(container.querySelector('[data-counter]'))).toBe(true);

        await click(frame.querySelector('[data-plurid-control="pinned-collapse"]')!);
        expect(frame.getAttribute('data-plurid-collapsed')).toBeNull();
        expect(frame.style.height).toBe('300px');

        // and the bar's place button puts it into the space
        await act(async () => {
            (frame.querySelector('[data-plurid-control="pinned-place"]') as HTMLElement).click();
            await Promise.resolve();
        });
        await flushFrames(1);
        expect(handle.planes.pinned()).toEqual([]);
        expect(mounts).toBe(1);
        await rendered.unmount();
    });

    it('INPUT OUTSIDE THE PINNED PLANES IS THE SPACE\'S; on a pinned plane it is the plane\'s', async () => {
        installFrameClock();
        const rendered = await render();
        const { container, handle, a, view } = rendered;
        await act(async () => {
            handle.planes.pin(a, { x: 600, y: 20, width: 360, height: 400 });
        });
        const frame = pinned.frame(container, a)!;
        const camera = () => rendered.api.getSnapshot().space.camera;

        // with the grab armed, a drag on the frame (its bar, outside any plane's content) moves
        // nothing, nor does a wheel or an arrow key on it
        const before = camera();
        await gestures.key(view, 'KeyG');
        expect(rendered.api.getSnapshot().ui.grabMode).toBe(true);
        await gestures.drag(frame.querySelector('[data-plurid-pinned-content]')!.previousElementSibling!, { x: 700, y: 30 }, { x: 860, y: 90 }, { steps: 4 });
        await gestures.wheel(frame, { deltaY: -120, x: 700, y: 200 });
        await gestures.key(frame, 'ArrowLeft');
        await flushFrames(2);
        expect(camera()).toEqual(before);

        // a drag beside it orbits, as ever: the layer lets the press through to the space
        await gestures.drag(view, { x: 100, y: 500 }, { x: 260, y: 500 }, { steps: 4 });
        await flushFrames(2);
        expect(camera().yaw).not.toBe(before.yaw);
        await rendered.unmount();
    });

    it('stacks on top of the others it is pressed on, and an anchor on it answers without a move', async () => {
        const rendered = await render();
        const { container, handle, a } = rendered;
        const b = handle.tree.get()[1].planeID;
        await act(async () => {
            handle.planes.pin(a, { x: 20, y: 20, width: 300, height: 300 });
            handle.planes.pin(b, { x: 60, y: 60, width: 300, height: 300 });
        });
        expect(handle.planes.pinned().map((plane) => plane.planeID)).toEqual([a, b]);
        await act(async () => {
            pinned.frame(container, a)!.dispatchEvent(new (window as any).PointerEvent('pointerdown', { bubbles: true }));
        });
        expect(handle.planes.pinned().map((plane) => plane.planeID)).toEqual([b, a]);
        expect(Number(pinned.frame(container, a)!.style.zIndex)).toBeGreaterThan(Number(pinned.frame(container, b)!.style.zIndex));

        const camera = rendered.api.getSnapshot().space.camera;
        let resolution: unknown;
        await act(async () => {
            resolution = handle.camera.anchor({ path: handle.tree.get()[0].route });
        });
        expect(resolution).toMatchObject({ ok: true, planeID: a, pinned: true });
        await flushFrames(2);
        expect(rendered.api.getSnapshot().space.camera).toEqual(camera);
        await rendered.unmount();
    });

    it('a press on a pinned plane does not pause a tour; a press on the space does', async () => {
        const rendered = await render();
        const { container, handle, a, view } = rendered;
        const b = handle.tree.get()[1];
        await act(async () => {
            handle.planes.pin(a, { x: 600, y: 20, width: 360, height: 400 });
        });
        await act(async () => {
            handle.tour.play({ plurid: 'plurid/tour', version: 1, steps: [{ id: 'b', anchor: { path: b.route }, dwell: null }] });
        });
        await flushFrames(4);
        expect(handle.tour.state().status).not.toBe('paused');
        const frame = pinned.frame(container, a)!;
        await act(async () => {
            frame.querySelector('[data-counter]')!.dispatchEvent(new (window as any).PointerEvent('pointerdown', { bubbles: true, clientX: 700, clientY: 200 }));
        });
        expect(handle.tour.state().status).not.toBe('paused');
        await act(async () => {
            view.dispatchEvent(new (window as any).PointerEvent('pointerdown', { bubbles: true, clientX: 100, clientY: 500 }));
        });
        expect(handle.tour.state()).toMatchObject({ status: 'paused', paused: 'input' });
        await rendered.unmount();
    });

    it('A PINNED PLANE IS NEVER CULLED: the camera far away, its content stays whole in its frame', async () => {
        mounts = 0;
        unmounts = 0;
        const rendered = await renderPlurid({
            planes,
            view: ['/a', '/b'],
            configuration: { space: { culling: { enabled: true, detach: { mode: 'unmount', delay: 0 } }, navigation: { motion: { duration: 0 } } } } as any,
        });
        await flushFrames(2);
        const { container, handle, api } = rendered;
        const [a, b] = handle.tree.get().map((plane) => plane.planeID);
        await act(async () => {
            handle.planes.pin(a, { x: 600, y: 20, width: 360, height: 400 });
        });
        (document.activeElement as HTMLElement | null)?.blur();
        const home = api.getSnapshot().space.camera;
        await act(async () => {
            api.store.dispatch({ type: 'space/setCamera', payload: { ...home, pivot: { x: 0, y: 100000, z: 0 } } });
        });
        // the pass detaches the plane left in the space, never the pinned one
        const started = Date.now();
        while (!api.getSnapshot().space.culled.detached.includes(b)) {
            if (Date.now() - started > 3000) {
                throw new Error('the culling pass never detached the plane in the space');
            }
            await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });
        }
        const culled = api.getSnapshot().space.culled;
        expect([...culled.hidden, ...culled.frozen, ...culled.detached]).not.toContain(a);
        expect(pinned.frame(container, a)!.querySelector('[data-counter]')).toBeTruthy();
        expect(unmounts).toBe(0);
        await rendered.unmount();
    });

    it('opens a route pinned, and the bus lists the pinned planes', async () => {
        const rendered = await render();
        const { container, handle, api } = rendered;
        const seen: unknown[] = [];
        const id = api.pubsub.subscribe({
            topic: 'space.changed',
            callback: (data: any) => {
                if (data?.kind === 'pinned') {
                    seen.push(data.value);
                }
            },
        } as any);
        const before = handle.tree.get().map((plane) => plane.location);
        let opened: string | undefined;
        await act(async () => {
            opened = handle.planes.open('/b', { rect: { x: 10, y: 10, width: 300, height: 200 } });
        });
        await flushFrames(2);
        expect(opened).toBeTruthy();
        expect(pinned.frame(container, opened!)).toBeTruthy();
        expect(handle.tree.get().slice(0, 2).map((plane) => plane.location)).toEqual(before);
        expect(seen.at(-1)).toEqual([expect.objectContaining({ planeID: opened, frame: { left: 10, top: 10, width: 300, height: 200 } })]);
        api.pubsub.unsubscribe?.(id as any);
        await rendered.unmount();
    });
});


describe('a server-rendered application', () => {
    it('HYDRATES ITS CONTENT IN PLACE, and the first pin of a plane mounts its content once more, into its host', async () => {
        installPointerEvents();
        installMatchMedia();
        mounts = 0;
        unmounts = 0;
        const configuration = { space: { navigation: { motion: { duration: 0 } } } } as any;
        const html = renderToString(
            <PluridProvider metastate={{ states: {} } as any}>
                <PluridApplication id="pinned-ssr" planes={planes as any} view={['/a', '/b']} configuration={configuration} />
            </PluridProvider>,
        );
        expect(html).not.toContain('data-plurid-content-host');
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);
        const recoverable: unknown[] = [];
        const handle = React.createRef<PluridApplicationHandle>();
        let root: Root | undefined;
        await act(async () => {
            root = hydrateRoot(
                container,
                <PluridProvider metastate={{ states: {} } as any}>
                    <PluridApplication ref={handle as any} id="pinned-ssr" planes={planes as any} view={['/a', '/b']} configuration={configuration} />
                </PluridProvider>,
                { onRecoverableError: (error) => recoverable.push(error) },
            );
        });
        expect(recoverable).toEqual([]);
        expect(container.querySelector('[data-plurid-content-host]')).toBeNull();
        expect(mounts).toBe(1);

        const a = handle.current!.tree.get()[0].planeID;
        await act(async () => {
            handle.current!.planes.pin(a);
        });
        expect(pinned.where(container, a)).toBe('pinned');
        expect([mounts, unmounts]).toEqual([2, 1]);
        // from then on its content moves, never remounts
        await act(async () => {
            await handle.current!.planes.place(a);
        });
        expect(pinned.where(container, a)).toBe('space');
        expect([mounts, unmounts]).toEqual([2, 1]);
        await act(async () => {
            root?.unmount();
        });
        container.remove();
    });
});
// #endregion module
