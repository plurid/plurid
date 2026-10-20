/**
 * @jest-environment jsdom
 */
/**
 * THE GUIDES RENDER WHEN WHAT THEY DRAW CHANGES (2026-10-20). Their state mapping built the fallback
 * size as a new object every time, so `connect` never found it equal and the guides rendered again
 * at every dispatch of the store, a camera frame included.
 */
import React from 'react';

import {
    renderPlurid,
} from '../../../../testing';
import {
    alignmentGuidesState,
} from '../index';



const Page: React.FC = () => <div>page</div>;

describe('the alignment guides\' state', () => {
    it('maps one state to shallow-equal properties', async () => {
        const rendered = await renderPlurid({
            planes: [{ route: '/a', component: Page }],
            view: ['/a'],
        } as any);
        const state = rendered.api.getSnapshot() as any;
        const first = alignmentGuidesState(state) as unknown as Record<string, unknown>;
        const second = alignmentGuidesState(state) as unknown as Record<string, unknown>;
        for (const key of Object.keys(first)) {
            expect({ key, same: first[key] === second[key] }).toEqual({ key, same: true });
        }
        await rendered.unmount();
    });
});
