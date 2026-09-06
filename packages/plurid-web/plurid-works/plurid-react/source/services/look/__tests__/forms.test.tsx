/**
 * @jest-environment jsdom
 */
/**
 * The `look` knob end to end: the three forms reach the page as the one scoped stylesheet the View
 * carries, and a runtime switch through the `configuration` topic re-emits it.
 */
import React, { act } from 'react';

import { PLURID_PUBSUB_TOPIC } from '@plurid/plurid-data';

import { renderPlurid, RenderPluridProperties } from '../../../testing';



const scene: RenderPluridProperties = {
    planes: [{ route: '/one', component: () => <p>one</p> }],
    view: ['/one'],
};



const lookStyle = (
    container: HTMLElement,
): HTMLStyleElement | null => container.querySelector('style[data-plurid-look]');


describe('the look, end to end', () => {
    it('a preset name: its tokens, scoped to the application, and the name on the view', async () => {
        const { container, view, unmount } = await renderPlurid({ ...scene, configuration: { global: { look: 'paper' } } });
        const style = lookStyle(container);
        expect(style?.getAttribute('data-plurid-look')).toBe('paper');
        expect(view.getAttribute('data-plurid-look')).toBe('paper');
        expect(style?.textContent).toContain(`[data-plurid-application="${view.getAttribute('data-plurid-application')}"]`);
        expect(style?.textContent).toContain('--plurid-scheme: light;');
        expect(style?.textContent).toContain('color-scheme: light;');
        await unmount();
    });

    it('a base derives a custom look; a preset with tokens lays them over it', async () => {
        const base = { scheme: 'dark' as const, space: '#000000', surface: '#0b0b0d', ink: '#f2f2f2', accent: '#8ab4ff' };
        const custom = await renderPlurid({ ...scene, configuration: { global: { look: base } } });
        expect(lookStyle(custom.container)?.getAttribute('data-plurid-look')).toBe('custom');
        expect(lookStyle(custom.container)?.textContent).toContain('--plurid-space: #000000;');
        await custom.unmount();

        const over = await renderPlurid({ ...scene, configuration: { global: { look: { preset: 'ember', tokens: { accent: '#ff0000', radius: '4px' } } } } });
        const style = lookStyle(over.container);
        expect(style?.getAttribute('data-plurid-look')).toBe('ember+');
        expect(style?.textContent).toContain('--plurid-accent: #ff0000;');
        expect(style?.textContent).toContain('--plurid-radius: 4px;');
        await over.unmount();
    });

    it('a legacy theme name given to look is its nearest preset; nothing set is graphite', async () => {
        const legacy = await renderPlurid({ ...scene, configuration: { global: { look: 'night' as any } } });
        expect(lookStyle(legacy.container)?.getAttribute('data-plurid-look')).toBe('noir');
        await legacy.unmount();

        const plain = await renderPlurid(scene);
        expect(lookStyle(plain.container)?.getAttribute('data-plurid-look')).toBe('graphite');
        expect(lookStyle(plain.container)?.textContent).toContain('--plurid-dock-fade: var(--plurid-fade);');
        await plain.unmount();
    });

    it('a runtime switch through the configuration topic re-emits the stylesheet', async () => {
        const { container, view, api, unmount } = await renderPlurid({ ...scene, configuration: { global: { look: 'paper' } } });
        await act(async () => {
            api.pubsub.publish({
                topic: PLURID_PUBSUB_TOPIC.CONFIGURATION,
                data: { global: { look: 'noir' } },
            } as any);
        });
        expect(lookStyle(container)?.getAttribute('data-plurid-look')).toBe('noir');
        expect(view.getAttribute('data-plurid-look')).toBe('noir');
        expect(lookStyle(container)?.textContent).toContain('--plurid-scheme: dark;');
        // the legacy theme follows the look unless the host set one
        expect(api.getSnapshot().themes.general.type).toBe('dark');
        await unmount();
    });
});
