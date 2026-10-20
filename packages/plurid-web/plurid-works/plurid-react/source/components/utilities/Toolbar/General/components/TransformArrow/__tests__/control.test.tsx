/**
 * @jest-environment jsdom
 */
/**
 * EVERY BUTTON OF THE CHROME IS A CHROME CONTROL (2026-10-20). The transform arrows and the Transform
 * drawer's selection buttons skipped `chromeControl`, so a host's `button` rules (an appearance, a
 * min-height, an uppercase transform, a shadow) leaked into them.
 */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';

import {
    renderPlurid,
} from '../../../../../../../testing';
import {
    styledDeclarations,
} from '../../../../../../../testing/styles';
import {
    StyledPluridTransformArrow,
} from '../styled';



(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const Page: React.FC = () => <div>page</div>;

describe('the toolbar\'s own buttons', () => {
    it('reset what a host gives every button', async () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        await act(async () => {
            root.render(
                <StyleSheetManager shouldForwardProp={isPropValid}>
                    <StyledPluridTransformArrow pressed={false} theme={{} as any} data-arrow />
                </StyleSheetManager>,
            );
        });
        const arrow = container.querySelector('[data-arrow]') as HTMLElement;
        expect(styledDeclarations(arrow, 'min-height')).toContain('0');
        expect(styledDeclarations(arrow, 'text-transform')).toContain('none');
        await act(async () => {
            root.unmount();
        });
        container.remove();

        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }],
            view: ['/a'],
            configuration: { elements: { toolbar: { drawers: ['TRANSFORM'], toggledDrawers: ['TRANSFORM'] } } },
        } as any);
        await act(async () => {
            (rendered.container.querySelector('[data-plurid-control="toolbar-more"]') as HTMLElement).click();
        });
        const selection = rendered.container.querySelector('[data-plurid-control="selection-align-left"]') as HTMLElement;
        expect(selection).not.toBeNull();
        expect(styledDeclarations(selection.parentElement!, 'min-height', ' button')).toContain('0');
        await rendered.unmount();
    });
});
