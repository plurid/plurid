/**
 * @jest-environment jsdom
 */
/**
 * Total control over the chrome: the mode (`elements.chrome`), the show knobs, the slots called with
 * the chrome context, the plane-level slots, and `useLook` inside a slot.
 */
import React from 'react';

import { renderPlurid, RenderPluridProperties } from '../../../testing';
import { useLook } from '../../hooks/look';
import { PluridChromeContext, PluridPlaneChromeContext } from '..';



const scene: RenderPluridProperties = {
    planes: [
        { route: '/one', component: () => <p>one</p> },
        { route: '/two', component: () => <p>two</p> },
    ],
    view: ['/one', '/two'],
};

const controls = (container: HTMLElement, name: string) => container.querySelectorAll(`[data-plurid-control="${name}"]`).length;


describe('the chrome mode', () => {
    it('none: a space with planes and no engine chrome at all', async () => {
        const { container, unmount } = await renderPlurid({ ...scene, configuration: { elements: { chrome: 'none' } } });
        expect(container.querySelectorAll('[data-plurid-plane]').length).toBe(2);
        expect(container.querySelectorAll('[data-plurid-control]').length).toBe(0);
        expect(container.querySelectorAll('[data-plurid-overlay]').length).toBe(0);
        await unmount();
    });

    it('minimal: the plane bars and the ? stay; the toolbar, the viewcube and the minimap go', async () => {
        const { container, unmount } = await renderPlurid({ ...scene, configuration: { elements: { chrome: 'minimal' } } });
        expect(controls(container, 'toolbar-button')).toBe(0);
        expect(controls(container, 'viewcube')).toBe(0);
        expect(controls(container, 'minimap')).toBe(0);
        expect(controls(container, 'shortcuts')).toBe(1);
        expect(controls(container, 'plane-focus')).toBe(2);
        await unmount();
    });

    it('full (the default) renders everything; elements.shortcuts.show hides the ? alone', async () => {
        const all = await renderPlurid(scene);
        expect(controls(all.container, 'toolbar-button')).toBeGreaterThan(0);
        expect(controls(all.container, 'shortcuts')).toBe(1);
        await all.unmount();

        const noTrigger = await renderPlurid({ ...scene, configuration: { elements: { shortcuts: { show: false } } } });
        expect(controls(noTrigger.container, 'shortcuts')).toBe(0);
        expect(controls(noTrigger.container, 'toolbar-button')).toBeGreaterThan(0);
        await noTrigger.unmount();
    });
});


describe('the slots', () => {
    it('a slot is called with the chrome context and renders whatever the mode', async () => {
        const seen: PluridChromeContext[] = [];
        const { container, unmount } = await renderPlurid({
            ...scene,
            configuration: { elements: { chrome: 'none' }, global: { look: 'paper' } },
            renderToolbar: (context: PluridChromeContext) => {
                seen.push(context);
                return <nav data-plurid-overlay="host-toolbar" data-look={context.look.name} data-presentation={context.presentation} />;
            },
        });
        const host = container.querySelector('[data-plurid-overlay="host-toolbar"]');
        expect(host?.getAttribute('data-look')).toBe('paper');
        expect(host?.getAttribute('data-presentation')).toBe('space');
        expect(seen.length).toBeGreaterThan(0);
        expect(seen[0].tokens.scheme).toBe('light');
        expect(seen[0].docked).toBe('');
        expect(Array.isArray(seen[0].selection)).toBe(true);
        expect(typeof seen[0].pubsub.publish).toBe('function');
        expect(typeof seen[0].camera.scale).toBe('number');
        await unmount();
    });

    it('the plane-level slots get the plane: renderPlaneControls draws a bar per plane', async () => {
        const { container, unmount } = await renderPlurid({
            ...scene,
            renderPlaneControls: (context: PluridPlaneChromeContext) => (
                <div data-plurid-control="host-bar" data-route={context.route} data-plane={context.planeID} data-look={context.look.name} />
            ),
        });
        const bars = Array.from(container.querySelectorAll('[data-plurid-control="host-bar"]'));
        // the route is the plane's full address (`plurid://<host>/one`)
        expect(bars.map((bar) => new URL(bar.getAttribute('data-route') ?? '').pathname).sort()).toEqual(['/one', '/two']);
        expect(bars.every((bar) => bar.getAttribute('data-plane'))).toBe(true);
        expect(bars[0].getAttribute('data-look')).toBe('graphite');
        // the engine's own bar is not drawn
        expect(controls(container, 'plane-focus')).toBe(0);
        await unmount();
    });

    it('useLook inside a slot reads the look in force', async () => {
        const Probe: React.FC = () => {
            const look = useLook();
            return <i data-plurid-overlay="probe">{look.name}</i>;
        };
        const { container, unmount } = await renderPlurid({
            ...scene,
            configuration: { global: { look: 'ember' } },
            renderMinimap: () => <Probe />,
        });
        expect(container.querySelector('[data-plurid-overlay="probe"]')?.textContent).toBe('ember');
        await unmount();
    });
});
