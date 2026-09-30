import {
    cleanTemplate,
    resolveBackgroundStyle,
    escapeAttribute,
    recordToString,
    assetsPathRewrite,
    safeStore,
    globalsInjector,
} from '../';



describe('safeStore', () => {
    it('escapes `<` so a `</script>` payload cannot break out of the inline script', () => {
        const malicious = JSON.stringify({ note: '</script><script>alert(1)</script>' });
        const safe = safeStore(malicious);

        expect(safe).not.toContain('</script>');
        expect(safe).toContain('\\u003c'); // the `<` became <
        // still valid JSON once the escapes are interpreted by the JS parser
        expect(JSON.parse(safe.replace(/\\u003c/g, '<')).note).toBe('</script><script>alert(1)</script>');
    });

    it('leaves payloads without `<` unchanged', () => {
        const store = JSON.stringify({ a: 1, b: 'plain' });
        expect(safeStore(store)).toBe(store);
    });

    it('escapes U+2028 / U+2029 (line terminators to engines before ES2019) inside the JSON strings', () => {
        const store = JSON.stringify({ a: 'x\u2028y\u2029z' });
        const safe = safeStore(store);
        expect(safe).toBe('{"a":"x\\u2028y\\u2029z"}');
        expect(JSON.parse(safe).a).toBe('x\u2028y\u2029z');
    });
});


describe('escapeAttribute', () => {
    it('escapes the characters that would break out of a double-quoted attribute', () => {
        expect(escapeAttribute('" onload="alert(1)')).toBe('&quot; onload=&quot;alert(1)');
        expect(escapeAttribute('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d');
    });

    it('escapes `&` first so existing entities are not double-encoded into ambiguity', () => {
        expect(escapeAttribute('&quot;')).toBe('&amp;quot;');
    });
});


describe('recordToString', () => {
    it('renders space-separated, escaped key="value" pairs', () => {
        expect(recordToString({ lang: 'en', dir: 'ltr' })).toBe('lang="en" dir="ltr"');
    });

    it('escapes a value that would break out of the attribute', () => {
        expect(recordToString({ data: '"><script>' })).toBe('data="&quot;&gt;&lt;script&gt;"');
    });

    it('returns an empty string for undefined', () => {
        expect(recordToString(undefined)).toBe('');
    });
});


describe('assetsPathRewrite', () => {
    it('rewrites `="client/` asset references to root-absolute `="/`', () => {
        expect(assetsPathRewrite('<img src="client/logo.png">')).toBe('<img src="/logo.png">');
    });

    it('leaves non-client asset paths untouched', () => {
        expect(assetsPathRewrite('<img src="/static/logo.png">')).toBe('<img src="/static/logo.png">');
    });
});


describe('globalsInjector', () => {
    it('emits a `window.<key> = <value>;` assignment per global', () => {
        const out = globalsInjector({ FOO: '1', BAR: '"x"' });
        expect(out).toContain('window.FOO = 1;');
        expect(out).toContain('window.BAR = "x";');
    });

    it('returns an empty string for no globals', () => {
        expect(globalsInjector({})).toBe('');
    });

    it('writes a `</script>` in a value as `\u003c/script>`: the inline script cannot be closed from the data (2026-09-29)', () => {
        const out = globalsInjector({ __PRELOADED_REDUX_STATE__: JSON.stringify({ search: '</script><script>alert(1)</script>' }) });
        expect(out).not.toContain('</script>');
        expect(out).toContain('\\u003c/script>');
        // the value reads back unchanged
        const window: Record<string, any> = {};
        new Function('window', out)(window);
        expect(window.__PRELOADED_REDUX_STATE__.search).toBe('</script><script>alert(1)</script>');
    });

    it('refuses a key that is not a JavaScript identifier', () => {
        expect(() => globalsInjector({ 'a = alert(1); window.b': '1' })).toThrow(/not a JavaScript identifier/);
        expect(() => globalsInjector({ 'a-b': '1' })).toThrow(/not a JavaScript identifier/);
        expect(globalsInjector({ $valid_Name1: '1' })).toBe('window.$valid_Name1 = 1;\n');
    });

    it('serializes a value that is not a string (a JavaScript host passing an object)', () => {
        const out = globalsInjector({ STATE: { a: '<b>' } as any });
        expect(out).toBe('window.STATE = {"a":"\\u003cb>"};\n');
    });
});


describe('resolveBackgroundStyle', () => {
    it('derives the gradient from the metastate theme (dark)', () => {
        const store = JSON.stringify({
            themes: {
                general: {
                    type: 'dark',
                    backgroundColorPrimary: 'hsl(1)',
                    backgroundColorTertiary: 'hsl(3)',
                },
            },
        });

        expect(resolveBackgroundStyle(store)).toEqual({
            gradientBackground: 'hsl(3)', // dark → tertiary
            gradientForeground: 'hsl(1)', // dark → primary
        });
    });

    it('falls back to the default gradient on unparseable input', () => {
        const fallback = resolveBackgroundStyle('not-json');
        expect(fallback.gradientBackground).toBe('hsl(220, 10%, 32%)');
        expect(fallback.gradientForeground).toBe('hsl(220, 10%, 18%)');
    });

    it('falls back to the default when no theme is present', () => {
        const fallback = resolveBackgroundStyle(JSON.stringify({ themes: {} }));
        expect(fallback.gradientBackground).toBe('hsl(220, 10%, 32%)');
    });
});


describe('cleanTemplate', () => {
    it('collapses runs of whitespace between tags', async () => {
        const out = await cleanTemplate('<p>x</p>\n\n\n     <p>y</p>');
        expect(out).toContain('<p>x</p>');
        expect(out).toContain('<p>y</p>');
        expect(out).not.toMatch(/\n/);
        expect(out).not.toMatch(/ {3,}/);
    });
});
