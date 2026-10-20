/**
 * @jest-environment jsdom
 */
/**
 * THE MENUS' FIRST HEADING RULE IS A VALID SELECTOR (2026-10-20). `h5::first-child` names a
 * pseudo-element that does not exist, so a browser dropped the rule and the first heading kept its
 * top margin.
 */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import {
    StyledPluridMoreMenuScroll,
} from '../styled';
import {
    StyledPluridMenuUniversesScroll,
} from '../../MenuUniverses/styled';



(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('the menus\' styles', () => {
    it('select the first heading with a pseudo-class', async () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        await act(async () => {
            root.render(
                <>
                    <StyledPluridMoreMenuScroll><h5>a</h5></StyledPluridMoreMenuScroll>
                    <StyledPluridMenuUniversesScroll><h5>b</h5></StyledPluridMenuUniversesScroll>
                </>,
            );
        });
        const css = [...document.querySelectorAll('style')].map((style) => style.textContent).join('\n');
        expect(css).not.toContain('::first-child');
        expect(css).toContain('h5:first-child');
        await act(async () => {
            root.unmount();
        });
        container.remove();
    });
});
