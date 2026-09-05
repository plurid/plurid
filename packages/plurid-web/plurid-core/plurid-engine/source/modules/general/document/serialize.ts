// #region imports
    // #region libraries
    import {
        PluridDocument,
        PluridDocumentScript,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import {
        documentKey,
        resolveTitle,
    } from './index';
    // #endregion internal
// #endregion imports



// #region module
/** The attribute on server-emitted, client-managed head elements (base, scripts, styles, JSON-LD). */
export const DOCUMENT_ELEMENT_ATTRIBUTE = 'data-plurid-document';


export const escapeText = (
    value: string,
): string => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');


export const escapeAttribute = (
    value: string,
): string => String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');


/** ` key="value"` pairs (undefined / null skipped; `true` → the bare attribute). */
export const serializeAttributes = (
    record: Record<string, string | boolean | undefined | null> | undefined,
): string => {
    if (!record) {
        return '';
    }
    let result = '';
    for (const [key, value] of Object.entries(record)) {
        if (value === undefined || value === null || value === false) {
            continue;
        }
        result += value === true
            ? ' ' + key
            : ' ' + key + '="' + escapeAttribute(value) + '"';
    }
    return result;
};


/** JSON inside a `<script>`: `<` escaped so `</script>` can never break out. */
export const safeJSON = (
    value: unknown,
): string => JSON.stringify(value).replace(/</g, '\\u003c');


const serializeScript = (
    script: PluridDocumentScript,
    key: string,
    nonce?: string,
): string => '<script' + serializeAttributes({
    id: script.id,
    src: script.src,
    async: script.async,
    defer: script.defer,
    type: script.type,
    nonce: script.nonce ?? nonce,
    [DOCUMENT_ELEMENT_ATTRIBUTE]: key,
}) + '>' + (script.content ?? '') + '</script>';


/**
 * The `<head>` markup of a merged document, in a fixed order: base, title, meta (charset first),
 * links, styles, head scripts, noscript, JSON-LD. Every element the client MANAGES itself (base,
 * scripts, styles, JSON-LD) carries `data-plurid-document="<key>"` so the client adopts it instead
 * of duplicating it; title / meta / link are React hoistables the client claims by itself.
 */
export const serializeDocumentHead = (
    document: PluridDocument,
    options: { nonce?: string } = {},
): string => {
    const parts: string[] = [];

    if (document.base) {
        parts.push('<base' + serializeAttributes({
            href: document.base.href,
            target: document.base.target,
            [DOCUMENT_ELEMENT_ATTRIBUTE]: 'base',
        }) + '>');
    }

    const title = resolveTitle(document);
    if (title !== undefined) {
        parts.push('<title>' + escapeText(title) + '</title>');
    }

    const meta = [...(document.meta ?? [])].sort((a, b) => (
        (a.charset !== undefined ? 0 : 1) - (b.charset !== undefined ? 0 : 1)
    ));
    for (const item of meta) {
        parts.push('<meta' + serializeAttributes({
            charset: item.charset,
            name: item.name,
            property: item.property,
            'http-equiv': item.httpEquiv,
            itemprop: item.itemProp,
            content: item.content,
            media: item.media,
        }) + '>');
    }

    for (const link of document.links ?? []) {
        const attributes: Record<string, string | undefined> = { ...link };
        delete attributes.precedence;
        const record: Record<string, string | undefined> = {};
        if (link.precedence) {
            record['data-precedence'] = link.precedence;
        }
        parts.push('<link' + serializeAttributes({ ...attributes, ...record }) + '>');
    }

    for (const style of document.styles ?? []) {
        const key = documentKey.style(style);
        if (style.content === undefined && style.href) {
            parts.push('<link' + serializeAttributes({
                rel: 'stylesheet',
                href: style.href,
                media: style.media,
                'data-precedence': style.precedence,
                [DOCUMENT_ELEMENT_ATTRIBUTE]: key,
            }) + '>');
            continue;
        }
        parts.push('<style' + serializeAttributes({
            id: style.id,
            media: style.media,
            'data-precedence': style.precedence,
            'data-href': style.precedence ? (style.href ?? key) : undefined,
            [DOCUMENT_ELEMENT_ATTRIBUTE]: key,
        }) + '>' + (style.content ?? '') + '</style>');
    }

    for (const script of document.scripts ?? []) {
        if (script.placement === 'body') {
            continue;
        }
        parts.push(serializeScript(script, documentKey.script(script), options.nonce));
    }

    for (const content of document.noscript ?? []) {
        parts.push('<noscript>' + content + '</noscript>');
    }

    (document.jsonLd ?? []).forEach((data, index) => {
        parts.push('<script' + serializeAttributes({
            type: 'application/ld+json',
            nonce: options.nonce,
            [DOCUMENT_ELEMENT_ATTRIBUTE]: 'jsonld:' + documentKey.jsonLd(data, index),
        }) + '>' + safeJSON(data) + '</script>');
    });

    return parts.join('\n');
};


/** The scripts placed before `</body>`, one string each. */
export const serializeBodyScripts = (
    document: PluridDocument,
    options: { nonce?: string } = {},
): string[] => (document.scripts ?? [])
    .filter((script) => script.placement === 'body')
    .map((script) => serializeScript(script, documentKey.script(script), options.nonce));


const HOISTABLE = /^\s*(<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*?\/?>|<link\b[^>]*?\/?>|<style\b[^>]*>[\s\S]*?<\/style>|<script\b[^>]*\basync\b[^>]*>[\s\S]*?<\/script>)/i;


/**
 * React 19 emits hoistable elements (`<title>`, `<meta>`, `<link>`, `<style precedence>`,
 * `<script async>`) rendered anywhere in a FRAGMENT render as a prefix of the string, before the
 * root element. Split that prefix off so a server can put it where it belongs (the `<head>`).
 */
export const splitHoistablePrefix = (
    html: string,
): { head: string; content: string } => {
    let head = '';
    let content = html;
    for (;;) {
        const match = HOISTABLE.exec(content);
        if (!match) {
            break;
        }
        head += match[1];
        content = content.slice(match[0].length);
    }
    return {
        head,
        content: head ? content.replace(/^\s+/, '') : content,
    };
};
// #endregion module
