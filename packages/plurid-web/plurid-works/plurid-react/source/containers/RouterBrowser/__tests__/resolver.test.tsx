/**
 * @jest-environment jsdom
 */
/**
 * A ROUTE'S RESOLVER IS THE SERVER'S (2026-10-20). The browser router called it with no globals
 * (`resolver(undefined)`) and threw the result away: a resolver with side effects, or one that read
 * its globals, ran in the browser for nothing.
 */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import PluridRouterBrowser from '../index';
import {
    installPointerEvents,
    installMatchMedia,
} from '../../../testing';



(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const Page: React.FC = () => <div data-page>page</div>;

describe('a route with a resolver', () => {
    it('is not resolved by the browser router', async () => {
        installPointerEvents();
        installMatchMedia();
        (Element.prototype as any).scrollIntoView = () => {};
        window.history.replaceState(null, '', '/');
        const resolver = jest.fn(() => ({}));
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        await act(async () => {
            root.render(<PluridRouterBrowser routes={[{ value: '/', planes: [['/p', Page]], view: ['/p'], resolver }] as any} />);
        });
        expect(container.querySelector('[data-page]')).not.toBeNull();
        expect(resolver).not.toHaveBeenCalled();
        await act(async () => {
            root.unmount();
        });
        container.remove();
    });
});
