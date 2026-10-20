/**
 * @jest-environment jsdom
 */
/**
 * HEADLESS IS HEADLESS (2026-10-20). Under `chrome: 'none'` the mode badge still named the mode a key
 * entered, and the space debugger still drew its HUD: no check of the chrome mode was ever made for
 * either, though the debugger had its least mode.
 */
import React, { act } from 'react';

import {
    renderPlurid,
    gestures,
} from '../../../../testing';



const Page: React.FC = () => <div>page</div>;
const render = (chrome: 'none' | 'full') => renderPlurid({
    planes: [{ route: '/a', component: Page }],
    view: ['/a'],
    configuration: { elements: { chrome }, development: { spaceDebugger: true } },
} as any);
const settle = () => act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
});

describe('the chrome mode none', () => {
    it('shows no mode badge and no space debugger; full shows both', async () => {
        const full = await render('full');
        await gestures.key(full.view, 'KeyG');
        await settle();
        expect(full.container.querySelector('[data-plurid-entity="PluridModeBadge"]')).not.toBeNull();
        expect(full.container.querySelector('[data-plurid-entity="PluridSpaceDebugger"]')).not.toBeNull();
        await full.unmount();

        const none = await render('none');
        await gestures.key(none.view, 'KeyG');
        await settle();
        expect(none.container.querySelector('[data-plurid-entity="PluridModeBadge"]')).toBeNull();
        expect(none.container.querySelector('[data-plurid-entity="PluridSpaceDebugger"]')).toBeNull();
        await none.unmount();
    });
});
