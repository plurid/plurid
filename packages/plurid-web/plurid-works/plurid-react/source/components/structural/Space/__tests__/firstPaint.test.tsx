// #region imports
    // #region libraries
    import React from 'react';

    import {
        renderToString,
    } from 'react-dom/server';
    // #endregion libraries


    // #region external
    import PluridApplication from '~containers/Application';
    import PluridProvider from '~containers/Provider';
    import PluridRouterStatic from '~containers/RouterStatic';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE SERVER'S PAGE IS A PAGE.
 *
 * The space waits for the browser's first layout before it shows (`resolvedLayout`, false until the
 * View has measured itself), so a client-only application never paints a frame laid out for a view
 * it has not measured. A server cannot measure, so its render was that hidden frame: every
 * server-rendered page painted blank until its script ran (2026-09-29), where the page presentation
 * promises the docked page to a crawler and to the first paint. Under the server's metastate — the
 * one the kit's client hydrates with — a page shows from its first render; the space presentation
 * keeps its fade-in.
 */
const page = () => <p>page</p>;

const spaceOpacity = (
    element: React.ReactElement,
) => {
    const html = renderToString(element);
    const tag = /<div[^>]*data-plurid-entity="PluridSpace"[^>]*>/.exec(html)?.[0] ?? '';
    return /opacity:\s*([\d.]+)/.exec(tag)?.[1];
};

const application = (
    presentation?: 'page',
) => (
    <PluridApplication
        planes={[{ route: '/one', component: page }]}
        view={['/one']}
        configuration={presentation ? { space: { presentation } } as any : undefined}
    />
);

const metastate = { states: {} };


describe('the first paint of the space', () => {
    it('a server-rendered page shows its page from the first render', () => {
        expect(spaceOpacity(
            <PluridProvider metastate={metastate}>
                {application('page')}
            </PluridProvider>,
        )).toBe('1');
    });

    it('a client-only page waits for its first layout', () => {
        expect(spaceOpacity(application('page'))).toBe('0');
    });

    it('a server-rendered space keeps its fade-in', () => {
        expect(spaceOpacity(
            <PluridProvider metastate={metastate}>
                {application()}
            </PluridProvider>,
        )).toBe('0');
    });
});


/**
 * The router covers its first frames with black until it has mounted (`fadeIn`, 10 ms). Rendered
 * by a server, that cover was the page: black at z-index 999999 over everything, until the script
 * ran (2026-09-29). A server-rendered route has no cover; a client-only one keeps it.
 */
describe('the router\'s cover', () => {
    const routes = [{
        value: '/',
        planes: [['/one', page]],
        view: ['/one'],
        defaultConfiguration: { space: { presentation: 'page' } },
    }] as any;

    const route = () => (
        <PluridRouterStatic
            path="/"
            routes={routes}
            planes={[]}
            hostname="localhost"
        />
    );

    it('is not over a server-rendered page', () => {
        const html = renderToString(
            <PluridProvider metastate={metastate}>
                {route()}
            </PluridProvider>,
        );

        expect(html).toContain('data-plurid-entity="PluridView"');
        expect(html).not.toContain('data-plurid-cover');
    });

    it('is over a client-only first frame', () => {
        expect(renderToString(route())).toContain('data-plurid-cover');
    });
});


/**
 * THE SERVER'S PAGE IS THE WINDOW'S. A server has no view to measure, and laid its page out for the
 * boot fallback (771 × 764): the first paint was a 771 × 764 box — cut off on a phone, a third of a
 * wide screen — until the script ran and the page grew to the window (2026-09-29). Docked before
 * the view is measured, the page is stated in the view's own terms (`services/logic/docking/unmeasured`).
 */
describe('the server\'s docked page', () => {
    const styleOf = (
        html: string,
        attribute: string,
    ) => new RegExp(`<div[^>]*${attribute}[^>]*>`).exec(html)?.[0].match(/style="([^"]*)"/)?.[1] ?? '';

    const served = () => renderToString(
        <PluridProvider metastate={metastate}>
            {application('page')}
        </PluridProvider>,
    );

    it('is the view\'s box, not the fallback\'s: sized and placed as fractions of the view', () => {
        const html = served();
        const roots = styleOf(html, 'data-plurid-entity="PluridRoots"');
        const docked = styleOf(html, 'data-plurid-page="docked"');

        expect(roots).toContain('height:100%');
        expect(roots).toMatch(/transform:translate\(50%, 50%\) .*translate\(-50%, -50%\)/);
        expect(docked).toContain('width:100%');
        expect(docked).toContain('height:100%');
        expect(html).not.toMatch(/771px|764px/);
    });

    it('a page a fraction of the view wide is that fraction of the window, centered', () => {
        // docked on the page the request names (under a router, the `page` parameter): a page
        // narrower than the view is not the identity camera's
        const html = renderToString(
            <PluridProvider metastate={metastate}>
                <PluridRouterStatic
                    path="/?page=%2Fone"
                    routes={[{
                        value: '/',
                        planes: [['/one', page], ['/two', page]],
                        view: ['/one', '/two'],
                        defaultConfiguration: { space: { presentation: 'page' }, elements: { plane: { width: 0.6 } } },
                    }] as any}
                    planes={[]}
                    hostname="localhost"
                />
            </PluridProvider>,
        );

        expect(styleOf(html, 'data-plurid-page="docked"')).toContain('width:60%');
        expect(styleOf(html, 'data-plurid-entity="PluridRoots"')).toMatch(/translate\(-30%, -50%\)/);
    });

    it('the space presentation, hidden until measured, keeps its placement', () => {
        const html = renderToString(
            <PluridProvider metastate={metastate}>
                {application()}
            </PluridProvider>,
        );

        expect(styleOf(html, 'data-plurid-entity="PluridRoots"')).not.toContain('translate(50%, 50%)');
    });
});
// #endregion module
