/**
 * @jest-environment jsdom
 */
/**
 * A plane is a named group for assistive technology: `role="group"`, a role description, and a name —
 * the declared document title, else the route path.
 */
import React from 'react';

import {
    renderPlurid,
} from '../../../../testing';



const Page: React.FC = () => <div>page</div>;

describe('a plane\'s accessible name', () => {
    it('is the declared title, else the route path; the role is a group described as a plane', async () => {
        const rendered = await renderPlurid({
            planes: [
                { route: '/site/about', component: Page, head: { title: 'About us' } },
                { route: '/site/contact', component: Page },
            ] as any,
            view: ['/site/about', '/site/contact'],
        });
        const [about, contact] = rendered.api.getSnapshot().space.tree;
        const element = (id: string) => rendered.container.querySelector(`[data-plurid-plane="${id}"]`) as HTMLElement;
        expect(element(about.planeID).getAttribute('role')).toBe('group');
        expect(element(about.planeID).getAttribute('aria-roledescription')).toBe('plane');
        expect(element(about.planeID).getAttribute('aria-label')).toBe('About us');
        expect(element(contact.planeID).getAttribute('aria-label')).toBe('/site/contact');
        rendered.unmount();
    });
});
