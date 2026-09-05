// #region imports
    // #region external
    import {
        normalizeDocument,
        mergeDocuments,
        resolveTitle,
        isEmptyDocument,
        documentKey,
        serializeDocumentHead,
        serializeBodyScripts,
        serializeAttributes,
        splitHoistablePrefix,
        escapeAttribute,
        escapeText,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
describe('document: normalize + merge', () => {
    it('turns the description / canonical sugar into a meta and a link and drops empties', () => {
        const document = normalizeDocument({
            title: '',
            description: 'a spatial registry',
            canonical: 'https://example.com/x',
            meta: [],
            htmlAttributes: {},
        });
        expect(document.title).toBeUndefined();
        expect(document.meta).toEqual([{ name: 'description', content: 'a spatial registry' }]);
        expect(document.links).toEqual([{ rel: 'canonical', href: 'https://example.com/x' }]);
        expect(document.htmlAttributes).toBeUndefined();
        expect(isEmptyDocument({})).toBe(true);
        expect(isEmptyDocument({ title: 'x' })).toBe(false);
    });

    it('later layers win per key, replacing in place; new keys append', () => {
        const merged = mergeDocuments(
            {
                title: 'app',
                titleTemplate: '%s · plurid',
                lang: 'en',
                meta: [
                    { charset: 'utf-8' },
                    { name: 'description', content: 'static' },
                    { property: 'og:title', content: 'app' },
                ],
                links: [{ rel: 'icon', href: '/a.png', sizes: '32x32' }, { rel: 'canonical', href: '/a' }],
                htmlAttributes: { 'data-theme': 'dark', lang: 'en' },
            },
            undefined,
            {
                title: 'plane',
                description: 'per plane',
                canonical: '/plane',
                meta: [{ name: 'robots', content: 'noindex' }],
                links: [{ rel: 'icon', href: '/b.png', sizes: '32x32' }],
                htmlAttributes: { 'data-theme': 'light' },
                jsonLd: [{ '@type': 'Article', name: 'x' }],
            },
        );
        expect(resolveTitle(merged)).toBe('plane · plurid');
        expect(merged.lang).toBe('en');
        // in place: the description keeps its slot, robots appends
        expect(merged.meta!.map((meta) => documentKey.meta(meta))).toEqual([
            'charset', 'name:description', 'property:og:title', 'name:robots',
        ]);
        expect(merged.meta![1].content).toBe('per plane');
        expect(merged.links).toEqual([
            { rel: 'icon', href: '/b.png', sizes: '32x32' },
            { rel: 'canonical', href: '/plane' },
        ]);
        expect(merged.htmlAttributes).toEqual({ 'data-theme': 'light', lang: 'en' });
        expect(merged.jsonLd).toHaveLength(1);
    });

    it('keys: media variants of a meta, sized icons, alternates, inline content hashes', () => {
        expect(documentKey.meta({ name: 'theme-color', content: '#fff', media: '(prefers-color-scheme: light)' }))
            .toBe('name:theme-color@(prefers-color-scheme: light)');
        expect(documentKey.link({ rel: 'alternate', hreflang: 'fr', href: '/fr' })).toBe('rel:alternate|fr|');
        expect(documentKey.link({ rel: 'preconnect', href: 'https://api' })).toBe('rel:preconnect|https://api|');
        expect(documentKey.script({ content: 'console.log(1)' })).toBe(documentKey.script({ content: 'console.log(1)' }));
        expect(documentKey.script({ content: 'a' })).not.toBe(documentKey.script({ content: 'b' }));
        expect(documentKey.jsonLd({ '@id': '#org' }, 3)).toBe('@id:#org');
        expect(documentKey.jsonLd({ '@type': 'Article' }, 2)).toBe('@type:Article#2');
    });

    it('a titleTemplate without a placeholder is ignored; base and noscript merge', () => {
        const merged = mergeDocuments(
            { title: 'a', titleTemplate: 'plurid', base: { href: '/' }, noscript: ['<p>no js</p>'] },
            { base: { target: '_blank' }, noscript: ['<p>no js</p>', '<p>really</p>'] },
        );
        expect(resolveTitle(merged)).toBe('a');
        expect(merged.base).toEqual({ href: '/', target: '_blank' });
        expect(merged.noscript).toEqual(['<p>no js</p>', '<p>really</p>']);
    });
});


describe('document: serialize', () => {
    it('renders the head in a fixed order with escaping, and tags the managed elements', () => {
        const head = serializeDocumentHead(mergeDocuments({
            title: 'A & B <plurid>',
            titleTemplate: '%s · "site"',
            meta: [{ name: 'description', content: 'x "y" <z>' }, { charset: 'utf-8' }],
            links: [{ rel: 'canonical', href: '/a?b=1&c=2' }],
            base: { href: '/app/' },
            styles: [{ id: 'theme', content: '.a{color:red}' }, { href: '/late.css', precedence: 'low' }],
            scripts: [{ src: '/x.js', async: true }, { content: 'window.a=1', placement: 'body' }],
            noscript: ['<p>enable js</p>'],
            jsonLd: [{ '@type': 'Article', name: '</script><b>' }],
        }));
        const lines = head.split('\n');
        expect(lines[0]).toBe('<base href="/app/" data-plurid-document="base">');
        expect(lines[1]).toBe('<title>A &amp; B &lt;plurid&gt; · "site"</title>');
        expect(lines[2]).toBe('<meta charset="utf-8">');
        expect(lines[3]).toBe('<meta name="description" content="x &quot;y&quot; &lt;z&gt;">');
        expect(lines[4]).toBe('<link rel="canonical" href="/a?b=1&amp;c=2">');
        expect(lines[5]).toBe('<style id="theme" data-plurid-document="id:theme">.a{color:red}</style>');
        expect(lines[6]).toBe('<link rel="stylesheet" href="/late.css" data-precedence="low" data-plurid-document="href:/late.css">');
        expect(lines[7]).toBe('<script src="/x.js" async data-plurid-document="src:/x.js"></script>');
        expect(lines[8]).toBe('<noscript><p>enable js</p></noscript>');
        expect(lines[9]).toContain('<script type="application/ld+json" data-plurid-document="jsonld:@type:Article#0">');
        expect(lines[9]).toContain('\\u003c/script>');
        expect(lines).toHaveLength(10);
        expect(serializeBodyScripts({ scripts: [{ content: 'window.a=1', placement: 'body' }] })[0])
            .toMatch(/^<script data-plurid-document="content:[0-9a-f]+">window.a=1<\/script>$/);
    });

    it('an empty document serializes to nothing', () => {
        expect(serializeDocumentHead({})).toBe('');
        expect(serializeAttributes({ a: undefined, b: false, c: true, d: 'x' })).toBe(' c d="x"');
        expect(escapeAttribute('"<>&')).toBe('&quot;&lt;&gt;&amp;');
        expect(escapeText('"<>&')).toBe('"&lt;&gt;&amp;');
    });

    it('splits the React 19 hoistable prefix off a fragment render', () => {
        const html = '<title>T</title><meta name="description" content="d"/><link rel="canonical" href="/x"/><div id="root"><p>hi</p></div>';
        const split = splitHoistablePrefix(html);
        expect(split.head).toBe('<title>T</title><meta name="description" content="d"/><link rel="canonical" href="/x"/>');
        expect(split.content).toBe('<div id="root"><p>hi</p></div>');
        expect(splitHoistablePrefix('<div>x</div>')).toEqual({ head: '', content: '<div>x</div>' });
        expect(splitHoistablePrefix('')).toEqual({ head: '', content: '' });
        // a non-async script is not a hoistable
        expect(splitHoistablePrefix('<script src="/a.js"></script><div/>').head).toBe('');
    });
});
// #endregion module
