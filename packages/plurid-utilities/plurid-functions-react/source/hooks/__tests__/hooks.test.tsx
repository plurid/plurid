/**
 * @jest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { useElementEvent, useGlobalKeyDown } from '../event';
import usePortal from '../portal';



const mount = async (element: React.ReactElement) => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    const container = document.createElement('div');
    document.body.appendChild(container);
    let root: Root | undefined;
    await act(async () => {
        root = createRoot(container);
        root.render(element);
    });
    return {
        container,
        rerender: async (next: React.ReactElement) => { await act(async () => { root!.render(next); }); },
        unmount: async () => { await act(async () => { root!.unmount(); }); container.remove(); },
    };
};


describe('useElementEvent (C14)', () => {
    it('an omitted target is the window; a null target subscribes nothing; cleanup never throws', async () => {
        const seen: string[] = [];
        const Probe: React.FC<{ target: any }> = ({ target }) => {
            useGlobalKeyDown(() => { seen.push('key'); }, target);
            return null;
        };
        const mounted = await mount(<Probe target={undefined} />);
        window.dispatchEvent(new KeyboardEvent('keydown'));
        expect(seen).toEqual(['key']);

        await mounted.rerender(<Probe target={null} />);
        window.dispatchEvent(new KeyboardEvent('keydown'));
        expect(seen).toEqual(['key']);
        await expect(mounted.unmount()).resolves.toBeUndefined();
    });

    it('a replaced target moves the listener; the old target keeps none', async () => {
        const a = document.createElement('div');
        const b = document.createElement('div');
        const seen: string[] = [];
        const Probe: React.FC<{ target: HTMLElement }> = ({ target }) => {
            useElementEvent('click', target, () => { seen.push(target === a ? 'a' : 'b'); });
            return null;
        };
        const mounted = await mount(<Probe target={a} />);
        a.dispatchEvent(new Event('click'));
        await mounted.rerender(<Probe target={b} />);
        a.dispatchEvent(new Event('click'));
        b.dispatchEvent(new Event('click'));
        expect(seen).toEqual(['a', 'b']);
        await mounted.unmount();
    });
});


describe('usePortal (C15)', () => {
    it('removes a container it created once empty; keeps a host-provided one', async () => {
        const parent = document.createElement('div');
        parent.id = 'portal-parent';
        document.body.appendChild(parent);
        const Probe: React.FC<{ id: string }> = ({ id }) => {
            usePortal(id, 'portal-parent');
            return null;
        };
        const owned = await mount(<Probe id="owned-container" />);
        expect(document.getElementById('owned-container')).not.toBeNull();
        await owned.unmount();
        expect(document.getElementById('owned-container')).toBeNull();

        const hostContainer = document.createElement('div');
        hostContainer.id = 'host-container';
        parent.appendChild(hostContainer);
        const shared = await mount(<Probe id="host-container" />);
        await shared.unmount();
        expect(document.getElementById('host-container')).toBe(hostContainer);
        parent.remove();
    });
});
