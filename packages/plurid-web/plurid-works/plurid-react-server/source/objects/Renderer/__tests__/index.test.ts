import PluridRenderer from '../';



// Integration over the real Renderer → template assembly path. Locks the security fixes (metastate +
// attribute escaping) and the basic SSR document shape end-to-end, without the Express/React-SSR machinery
// (route match → serverComputeMetastate → renderToString is covered by the live server fixtures + plurid-react).
describe('PluridRenderer — SSR HTML assembly', () => {
    const baseConfig = () => ({
        htmlLanguage: 'en',
        head: '',
        htmlAttributes: '',
        bodyAttributes: '',
        defaultStyle: '',
        styles: '',
        headScripts: [] as string[],
        bodyScripts: [] as string[],
        vendorScriptSource: '/vendor.js',
        mainScriptSource: '/main.js',
        content: '<div>hello plurid plane</div>',
        root: 'plurid-root',
        defaultPreloadedPluridMetastate: '__PLURID_METASTATE__',
        pluridMetastate: JSON.stringify({ note: 'a plain note' }),
        globals: {},
        minify: false,
    });

    it('renders the content into the root and assigns the metastate to window', async () => {
        const html = await new PluridRenderer(baseConfig()).html();

        expect(html).toContain('<div id="plurid-root"><div>hello plurid plane</div></div>');
        expect(html).toContain('window.__PLURID_METASTATE__ =');
        expect(html).toContain('a plain note');
        expect(html).toContain('<script defer src="/main.js">');
    });

    it('escapes a `</script>` payload in the metastate so it cannot break out of the inline script', async () => {
        const html = await new PluridRenderer({
            ...baseConfig(),
            pluridMetastate: JSON.stringify({ note: '</script><script>alert(1)</script>' }),
        }).html();

        // the raw breakout sequence must NOT survive; the escaped `<` form must be present
        expect(html).not.toContain('</script><script>alert(1)</script>');
        expect(html).toContain('\\u003c/script>');
    });

    it('passes html attribute values through into the html tag', async () => {
        // `htmlAttributes` reaches the renderer already stringified via `recordToString` (escaping happens
        // there) — assert the renderer places a benign attribute on the <html> element.
        const html = await new PluridRenderer({
            ...baseConfig(),
            htmlAttributes: 'data-theme="dark"',
        }).html();

        expect(html).toContain('<html lang="en" data-theme="dark">');
    });
});
