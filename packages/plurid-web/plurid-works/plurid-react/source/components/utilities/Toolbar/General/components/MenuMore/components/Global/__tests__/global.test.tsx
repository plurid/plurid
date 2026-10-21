/**
 * @jest-environment jsdom
 */
/**
 * THE GLOBAL DRAWER PICKS THE LOOK (2026-10-21). It offered the two legacy themes and the language:
 * the look, which the chrome and the planes are drawn in, could not be changed from the space.
 */
import React, { act } from 'react';

import themes, {
    themeFromLook,
} from '@plurid/plurid-themes';

import {
    generalEngine,
} from '~services/engine';

import {
    renderPlurid,
} from '../../../../../../../../../testing';



/** the elements holding only text that starts with `text`: a dropdown's selected value */
const leaves = (
    root: HTMLElement,
    text: string,
) => [...root.querySelectorAll('*')].filter((element) => element.childElementCount === 0
    && (element.textContent ?? '').trim().startsWith(text)) as HTMLElement[];
const item = (
    root: HTMLElement,
    text: string,
) => [...root.querySelectorAll('li')].find((element) => element.textContent === text) as HTMLElement;
const click = (element: HTMLElement) => act(async () => {
    element.click();
});

describe('the Global drawer', () => {
    it('picks the look first, then the themes plane content reads, `look` the first of them', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/one', component: () => <p>one</p> }],
            view: ['/one'],
            configuration: { elements: { toolbar: { show: true, toggledDrawers: ['GLOBAL'] } } } as any,
        });
        const { container, api } = rendered;
        await click(container.querySelector('[aria-label="More"]') as HTMLElement);

        await click(leaves(container, 'graphite')[0]);
        await click(item(container, 'paper'));
        expect(api.getSnapshot().configuration.global.look).toBe('paper');
        expect(container.querySelector('style[data-plurid-look]')?.getAttribute('data-plurid-look')).toBe('paper');
        expect(api.getSnapshot().themes.general).toEqual(themeFromLook(generalEngine.look.resolveLook('paper')));

        await click(leaves(container, 'look')[0]);
        const choices = [...container.querySelectorAll('li')].map((element) => element.textContent).filter(Boolean);
        expect(choices[0]).toBe('look');
        await click(item(container, 'plurid'));
        expect(api.getSnapshot().configuration.global.theme).toEqual({ general: 'plurid', interaction: 'look' });
        expect(api.getSnapshot().themes.general).toBe(themes.plurid);
        await rendered.unmount();
    });
});
