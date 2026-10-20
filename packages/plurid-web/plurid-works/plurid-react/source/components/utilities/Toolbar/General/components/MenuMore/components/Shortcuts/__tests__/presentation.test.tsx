/**
 * @jest-environment jsdom
 */
/**
 * THE SHORTCUTS DRAWER FOLLOWS THE PRESENTATION (2026-10-20). Its rows were described for the
 * presentation at the first render and kept when the space turned into a page (or back). No binding
 * of the table is page-only today, so the rows read the same in both; the description is asked for
 * the presentation in force all the same, so a page-only binding shows where it applies.
 */
import React, { act } from 'react';

import * as registry from '../../../../../../../../../services/logic/shortcuts/registry';
import {
    renderPlurid,
} from '../../../../../../../../../testing';



const Page: React.FC = () => <div>page</div>;

describe('the Shortcuts drawer', () => {
    it('describes the keys of the presentation in force', async () => {
        const describe = jest.spyOn(registry, 'describeShortcuts');
        try {
            const rendered = await renderPlurid({
                planes: [{ route: '/a', component: Page }],
                view: ['/a'],
                configuration: { elements: { toolbar: { drawers: ['SHORTCUTS'], toggledDrawers: ['SHORTCUTS'] } } },
            } as any);
            await act(async () => {
                (rendered.container.querySelector('[data-plurid-control="toolbar-more"]') as HTMLElement).click();
            });
            // the drawer's own calls: it asks for the presentation alone (the `?` sheet and the
            // palette ask with the modes too)
            const asked = () => describe.mock.calls
                .filter(([, context]) => !!context && Object.keys(context).join() === 'presentation')
                .map(([, context]) => context!.presentation);
            expect(asked()).toContain('space');
            await act(async () => {
                rendered.api.pubsub.publish({ topic: 'configuration', data: { space: { presentation: 'page' } } } as any);
            });
            expect(asked()).toContain('page');
            await rendered.unmount();
        } finally {
            describe.mockRestore();
        }
    });
});
