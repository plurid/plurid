// #region imports
    // #region libraries
    import {
        PluridDocument,
        PluridDocumentMeta,
        PluridDocumentLink,
        PluridDocumentScript,
        PluridDocumentStyle,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * The document head as pure data: normalize one layer, merge layers (later wins, keyed
 * deduplication), resolve the title. Serialization lives in `./serialize`.
 */

/** A short stable hash of inline content, the identity of an inline script/style without an id. */
export const contentHash = (
    value: string,
): string => {
    let hash = 5381;
    for (let index = 0; index < value.length; index += 1) {
        hash = ((hash << 5) + hash + value.charCodeAt(index)) | 0;
    }
    return (hash >>> 0).toString(16);
};


export const documentKey = {
    meta: (meta: PluridDocumentMeta): string => {
        const base = meta.charset !== undefined
            ? 'charset'
            : meta.name
                ? 'name:' + meta.name
                : meta.property
                    ? 'property:' + meta.property
                    : meta.httpEquiv
                        ? 'http-equiv:' + meta.httpEquiv
                        : meta.itemProp
                            ? 'itemprop:' + meta.itemProp
                            : 'content:' + (meta.content ?? '');
        return meta.media ? base + '@' + meta.media : base;
    },
    link: (link: PluridDocumentLink): string => {
        const rel = link.rel;
        if (rel === 'canonical' || rel === 'manifest' || rel === 'mask-icon') {
            return 'rel:' + rel;
        }
        if (rel === 'icon' || rel === 'shortcut icon' || rel === 'apple-touch-icon') {
            return 'rel:' + rel + '|' + (link.sizes ?? '');
        }
        if (rel === 'alternate') {
            return 'rel:alternate|' + (link.hreflang ?? '') + '|' + (link.type ?? '');
        }
        return 'rel:' + rel + '|' + (link.href ?? '') + '|' + (link.media ?? '');
    },
    script: (script: PluridDocumentScript): string => script.id
        ? 'id:' + script.id
        : script.src
            ? 'src:' + script.src
            : 'content:' + contentHash(script.content ?? ''),
    style: (style: PluridDocumentStyle): string => style.id
        ? 'id:' + style.id
        : style.href
            ? 'href:' + style.href
            : 'content:' + contentHash(style.content ?? ''),
    jsonLd: (data: Record<string, unknown>, index: number): string => typeof data['@id'] === 'string'
        ? '@id:' + data['@id']
        : '@type:' + String(data['@type'] ?? '') + '#' + index,
};


const defined = <T,>(value: T | undefined | null | ''): value is T => value !== undefined && value !== null && value !== '';


/**
 * One layer, canonical: the `description` / `canonical` sugar becomes a meta / a link (appended
 * last, so it wins over an explicit duplicate), empty fields are dropped.
 */
export const normalizeDocument = (
    document?: PluridDocument,
): PluridDocument => {
    if (!document) {
        return {};
    }

    const result: PluridDocument = {};
    if (defined(document.lang)) result.lang = document.lang;
    if (defined(document.dir)) result.dir = document.dir;
    if (defined(document.title)) result.title = document.title;
    if (defined(document.titleTemplate)) result.titleTemplate = document.titleTemplate;
    if (document.base && (defined(document.base.href) || defined(document.base.target))) {
        result.base = { ...document.base };
    }

    const meta = [...(document.meta ?? [])];
    if (defined(document.description)) {
        meta.push({ name: 'description', content: document.description });
    }
    const links = [...(document.links ?? [])];
    if (defined(document.canonical)) {
        links.push({ rel: 'canonical', href: document.canonical });
    }
    if (meta.length > 0) result.meta = meta;
    if (links.length > 0) result.links = links;
    if (document.styles && document.styles.length > 0) result.styles = [...document.styles];
    if (document.scripts && document.scripts.length > 0) result.scripts = [...document.scripts];
    if (document.noscript && document.noscript.length > 0) result.noscript = [...document.noscript];
    if (document.jsonLd && document.jsonLd.length > 0) result.jsonLd = [...document.jsonLd];
    if (document.htmlAttributes && Object.keys(document.htmlAttributes).length > 0) {
        result.htmlAttributes = { ...document.htmlAttributes };
    }
    if (document.bodyAttributes && Object.keys(document.bodyAttributes).length > 0) {
        result.bodyAttributes = { ...document.bodyAttributes };
    }

    return result;
};


export const isEmptyDocument = (
    document: PluridDocument | undefined,
): boolean => !document || Object.keys(normalizeDocument(document)).length === 0;


/**
 * Merge layers, lowest first: scalars — the last non-empty wins; keyed lists (meta, links,
 * styles, scripts, JSON-LD) — a later item with the same key replaces the earlier IN PLACE, a new
 * key appends; `noscript` deduplicates by content; html/body attributes merge per attribute.
 */
export const mergeDocuments = (
    ...layers: Array<PluridDocument | undefined>
): PluridDocument => {
    const result: PluridDocument = {};
    const meta = new Map<string, PluridDocumentMeta>();
    const links = new Map<string, PluridDocumentLink>();
    const styles = new Map<string, PluridDocumentStyle>();
    const scripts = new Map<string, PluridDocumentScript>();
    const jsonLd = new Map<string, Record<string, unknown>>();
    const noscript = new Set<string>();
    let htmlAttributes: Record<string, string> | undefined;
    let bodyAttributes: Record<string, string> | undefined;

    for (const raw of layers) {
        const layer = normalizeDocument(raw);
        if (layer.lang !== undefined) result.lang = layer.lang;
        if (layer.dir !== undefined) result.dir = layer.dir;
        if (layer.title !== undefined) result.title = layer.title;
        if (layer.titleTemplate !== undefined) result.titleTemplate = layer.titleTemplate;
        if (layer.base) result.base = { ...result.base, ...layer.base };
        for (const item of layer.meta ?? []) meta.set(documentKey.meta(item), item);
        for (const item of layer.links ?? []) links.set(documentKey.link(item), item);
        for (const item of layer.styles ?? []) styles.set(documentKey.style(item), item);
        for (const item of layer.scripts ?? []) scripts.set(documentKey.script(item), item);
        (layer.jsonLd ?? []).forEach((item, index) => jsonLd.set(documentKey.jsonLd(item, index), item));
        for (const item of layer.noscript ?? []) noscript.add(item);
        if (layer.htmlAttributes) htmlAttributes = { ...htmlAttributes, ...layer.htmlAttributes };
        if (layer.bodyAttributes) bodyAttributes = { ...bodyAttributes, ...layer.bodyAttributes };
    }

    if (meta.size > 0) result.meta = [...meta.values()];
    if (links.size > 0) result.links = [...links.values()];
    if (styles.size > 0) result.styles = [...styles.values()];
    if (scripts.size > 0) result.scripts = [...scripts.values()];
    if (jsonLd.size > 0) result.jsonLd = [...jsonLd.values()];
    if (noscript.size > 0) result.noscript = [...noscript];
    if (htmlAttributes) result.htmlAttributes = htmlAttributes;
    if (bodyAttributes) result.bodyAttributes = bodyAttributes;

    return result;
};


/** The rendered title: the template applied once (`'%s · plurid'`), or the bare title. */
export const resolveTitle = (
    document: PluridDocument,
): string | undefined => {
    if (!defined(document.title)) {
        return undefined;
    }
    if (defined(document.titleTemplate) && document.titleTemplate.includes('%s')) {
        return document.titleTemplate.replace('%s', document.title);
    }
    return document.title;
};
// #endregion module



// #region exports
export * from './serialize';
// #endregion exports
