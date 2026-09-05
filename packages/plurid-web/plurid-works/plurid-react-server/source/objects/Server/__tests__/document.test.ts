// #region imports
    // #region libraries
    import {
        createDocumentRegistry,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        documentFromTemplate,
        resolveRouteDocument,
        assembleDocument,
    } from '../document';
    // #endregion external
// #endregion imports



// #region module
describe('documentFromTemplate()', () => {
    it('projects the favicon set, the manifest, the language and the static head into one document', () => {
        const document = documentFromTemplate({
            htmlLanguage: 'en',
            htmlAttributes: { 'data-theme': 'dark' },
            favicon: {
                icon: '/favicon.ico',
                apple: '/apple.png',
                sizes: { '32x32': '/32.png' },
                maskIcon: '/mask.svg',
                themeColor: '#272A30',
            },
            manifest: '/manifest.json',
            head: {
                title: 'static',
                description: 'a static description',
                meta: [{ property: 'og:site_name', content: 'plurid' }],
            },
        });

        expect(document.lang).toBe('en');
        expect(document.title).toBe('static');
        expect(document.htmlAttributes).toEqual({ 'data-theme': 'dark' });
        expect(document.links).toEqual([
            { rel: 'icon', href: '/favicon.ico' },
            { rel: 'apple-touch-icon', href: '/apple.png' },
            { rel: 'icon', sizes: '32x32', href: '/32.png' },
            { rel: 'mask-icon', href: '/mask.svg', color: '#272A30' },
            { rel: 'manifest', href: '/manifest.json' },
        ]);
        expect(document.meta).toEqual([
            { name: 'theme-color', content: '#272A30' },
            { property: 'og:site_name', content: 'plurid' },
            { name: 'description', content: 'a static description' },
        ]);
        expect(documentFromTemplate(undefined)).toEqual({});
        expect(documentFromTemplate({ favicon: '/f.ico' }).links).toEqual([{ rel: 'icon', href: '/f.ico' }]);
    });
});


describe('resolveRouteDocument() / assembleDocument()', () => {
    it('resolves a static or async route head with the match context', async () => {
        const staticMatch: any = { kind: 'Route', match: { value: '/a', parameters: {}, query: {} }, data: { value: '/a', head: { title: 'a' } } };
        expect(await resolveRouteDocument(staticMatch)).toEqual({ title: 'a' });

        const asyncMatch: any = {
            kind: 'RoutePlane',
            match: { value: '/item/42', parameters: { id: '42' }, query: { q: '1' } },
            data: { value: '/item/:id', head: async (context: any) => ({ title: 'item ' + context.parameters.id + ' ' + context.query.q }) },
        };
        expect(await resolveRouteDocument(asyncMatch)).toEqual({ title: 'item 42 1' });
        expect(await resolveRouteDocument({ kind: 'Route', match: { value: '/' }, data: { value: '/' } } as any)).toBeUndefined();
    });

    it('layers template < route < planes < in-render < preserve < hook', () => {
        const registry = createDocumentRegistry({ server: true });
        registry.setBase('route', { title: 'route', description: 'route' });
        registry.setBase('planes', { title: 'planes', meta: [{ name: 'robots', content: 'index' }] });
        registry.set(registry.nextOrder(), { title: 'in-render' });

        const withoutHook = assembleDocument({
            template: { title: 'template', description: 'template', lang: 'en' },
            registry,
            preserve: { meta: [{ name: 'robots', content: 'noindex' }] },
        });
        expect(withoutHook.title).toBe('in-render');
        expect(withoutHook.lang).toBe('en');
        expect(withoutHook.meta).toEqual([
            { name: 'description', content: 'route' },
            { name: 'robots', content: 'noindex' },
        ]);

        const withHook = assembleDocument({
            template: { title: 'template' },
            registry,
            hook: { title: 'hook' },
        });
        expect(withHook.title).toBe('hook');
    });
});
// #endregion module
