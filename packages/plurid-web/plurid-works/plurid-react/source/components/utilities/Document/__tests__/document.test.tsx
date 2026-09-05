/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, {
        act,
        useState,
    } from 'react';

    import {
        createRoot,
        hydrateRoot,
        Root,
    } from 'react-dom/client';

    import {
        renderToString,
    } from 'react-dom/server';
    // #endregion libraries


    // #region external
    import {
        generalEngine,
    } from '~services/engine';

    import {
        createDocumentRegistry,
        usePluridDocument,
    } from '~services/document';

    import PluridDocument, {
        PluridDocumentScope,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
const { serializeDocumentHead } = generalEngine.document;

const flush = async () => {
    await act(async () => {
        await Promise.resolve();
    });
};

const heads = () => Array.from(document.head.children).map((element) => element.outerHTML);


describe('<PluridDocument> on the client', () => {
    let root: Root | undefined;
    let container: HTMLElement;

    beforeEach(() => {
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
        document.head.innerHTML = '<meta charset="utf-8">';
        document.body.innerHTML = '';
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(async () => {
        if (root) {
            await act(async () => root!.unmount());
            root = undefined;
        }
        container.remove();
    });

    it('renders ONE title where the deepest declaration wins, applies html/body attributes, manages JSON-LD, and withdraws on unmount', async () => {
        let setShowChild: (value: boolean) => void = () => {};
        const Child = () => {
            usePluridDocument({ title: 'child', meta: [{ name: 'robots', content: 'noindex' }] });
            return null;
        };
        const App = () => {
            const [showChild, setShow] = useState(true);
            setShowChild = setShow;
            return (
                <PluridDocumentScope>
                    <PluridDocument
                        title="layout"
                        titleTemplate="%s · plurid"
                        description="a layout"
                        lang="fr"
                        htmlAttributes={{ 'data-theme': 'dark' }}
                        bodyAttributes={{ 'data-plurid': 'yes' }}
                        jsonLd={[{ '@type': 'Article', name: 'x' }]}
                    >
                        <meta property="og:title" content="og" />
                    </PluridDocument>
                    {showChild && <Child />}
                </PluridDocumentScope>
            );
        };

        root = createRoot(container);
        await act(async () => {
            root!.render(<App />);
        });
        await flush();

        expect(document.querySelectorAll('title')).toHaveLength(1);
        expect(document.title).toBe('child · plurid');
        expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('a layout');
        expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
        expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('og');
        expect(document.documentElement.getAttribute('lang')).toBe('fr');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(document.body.getAttribute('data-plurid')).toBe('yes');
        const jsonLd = document.head.querySelector('script[type="application/ld+json"]');
        expect(jsonLd?.textContent).toBe('{"@type":"Article","name":"x"}');
        // hoistables are not left inside the container
        expect(container.querySelector('title')).toBeNull();

        await act(async () => {
            setShowChild(false);
        });
        await flush();
        expect(document.title).toBe('layout · plurid');
        expect(document.querySelector('meta[name="robots"]')).toBeNull();

        await act(async () => root!.unmount());
        root = undefined;
        expect(document.querySelectorAll('title')).toHaveLength(0);
        expect(document.documentElement.getAttribute('lang')).toBeNull();
        expect(document.body.getAttribute('data-plurid')).toBeNull();
        expect(document.head.querySelector('script[type="application/ld+json"]')).toBeNull();
    });

    it('hydrates a server-serialized head without duplicating anything (the load-bearing round-trip)', async () => {
        const Tree = () => (
            <PluridDocument
                title="registry"
                description="hypod registry"
                canonical="https://example.com/registry"
                jsonLd={[{ '@type': 'WebSite', name: 'hypod' }]}
                lang="en"
            >
                <meta property="og:title" content="registry" />
                <link rel="icon" href="/icon.png" />
            </PluridDocument>
        );
        const Page = () => (
            <div id="page">
                <Tree />
                <p>content</p>
            </div>
        );

        // server: collect during render, serialize the snapshot into <head>
        const registry = createDocumentRegistry({ server: true });
        const content = renderToString(
            <PluridDocumentScope registry={registry}>
                <Page />
            </PluridDocumentScope>,
        );
        const head = serializeDocumentHead(registry.snapshot());
        expect(head).toContain('<title>registry</title>');
        expect(content).not.toContain('<title>');

        // the browser loads the document
        document.head.innerHTML = '<meta charset="utf-8">' + head;
        document.body.innerHTML = '<div id="root">' + content + '</div>';
        const hydrationRoot = document.getElementById('root') as HTMLElement;
        const recoverable: unknown[] = [];

        await act(async () => {
            root = hydrateRoot(
                hydrationRoot,
                <PluridDocumentScope>
                    <Page />
                </PluridDocumentScope>,
                {
                    onRecoverableError: (error) => recoverable.push(error),
                },
            );
        });
        await flush();

        expect(recoverable).toEqual([]);
        expect(document.querySelectorAll('title')).toHaveLength(1);
        expect(document.title).toBe('registry');
        expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
        expect(document.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
        expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
        expect(document.querySelectorAll('link[rel="icon"]')).toHaveLength(1);
        expect(document.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
        expect(document.documentElement.getAttribute('lang')).toBe('en');
        expect(hydrationRoot.querySelector('#page p')?.textContent).toBe('content');
        expect(heads().filter((html) => html.startsWith('<title'))).toHaveLength(1);
    });

    it('parses Helmet-style children, including a JSON-LD script and html/body elements', async () => {
        root = createRoot(container);
        await act(async () => {
            root!.render(
                <PluridDocumentScope>
                    <PluridDocument>
                        <html lang="de" data-mode="x" />
                        <body className="app" />
                        <title>helmet style</title>
                        <meta name="description" content="from children" />
                        <link rel="canonical" href="/c" />
                        <script type="application/ld+json">{'{"@type":"Thing"}'}</script>
                    </PluridDocument>
                </PluridDocumentScope>,
            );
        });
        await flush();
        expect(document.title).toBe('helmet style');
        expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('from children');
        expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('/c');
        expect(document.documentElement.getAttribute('lang')).toBe('de');
        expect(document.documentElement.getAttribute('data-mode')).toBe('x');
        expect(document.body.getAttribute('class')).toBe('app');
        expect(document.head.querySelector('script[type="application/ld+json"]')?.textContent).toBe('{"@type":"Thing"}');
    });
});
// #endregion module
