// #region module
/**
 * The document head as DATA — plurid's replacement for a head-manager library. Every input
 * (the kit's static `head`, a route's or a plane's `head`, an in-render `usePluridDocument`, a
 * server preserve, the server's `document` hook) is a layer of this shape; the layers merge with
 * an explicit precedence and key-based deduplication, and the result is rendered ONCE per side —
 * a single `<title>`, which is exactly what hydrates clean.
 */
export interface PluridDocumentMeta {
    name?: string;
    property?: string;
    httpEquiv?: string;
    charset?: string;
    itemProp?: string;
    content?: string;
    media?: string;
}


export interface PluridDocumentLink {
    rel: string;
    href?: string;
    hreflang?: string;
    type?: string;
    sizes?: string;
    media?: string;
    as?: string;
    crossOrigin?: string;
    color?: string;
    /** React 19 stylesheet precedence (`rel="stylesheet"` only): hoisted and ordered by it. */
    precedence?: string;
    [attribute: string]: string | undefined;
}


export interface PluridDocumentScript {
    id?: string;
    src?: string;
    async?: boolean;
    defer?: boolean;
    type?: string;
    /** Inline content (trusted: rendered verbatim). */
    content?: string;
    nonce?: string;
    /** `head` (default) or `body` (before `</body>`, server only). */
    placement?: 'head' | 'body';
}


export interface PluridDocumentStyle {
    id?: string;
    href?: string;
    /** Inline CSS (trusted: rendered verbatim). */
    content?: string;
    /** React 19 precedence: hoisted and ordered by it (needs `href` or `id` as its identity). */
    precedence?: string;
    media?: string;
}


export interface PluridDocumentBase {
    href?: string;
    target?: string;
}


export interface PluridDocument {
    /** `<html lang>`. */
    lang?: string;
    /** `<html dir>`. */
    dir?: 'ltr' | 'rtl' | 'auto';
    title?: string;
    /** A template with `%s` for the title (`'%s · plurid'`); the highest layer that sets it wins. */
    titleTemplate?: string;
    /** Sugar for `meta[name="description"]`. */
    description?: string;
    /** Sugar for `link[rel="canonical"]`. */
    canonical?: string;
    base?: PluridDocumentBase;
    meta?: PluridDocumentMeta[];
    links?: PluridDocumentLink[];
    styles?: PluridDocumentStyle[];
    scripts?: PluridDocumentScript[];
    /** `<noscript>` head content (trusted HTML), server only. */
    noscript?: string[];
    /** JSON-LD objects, each its own `<script type="application/ld+json">`. */
    jsonLd?: Array<Record<string, unknown>>;
    htmlAttributes?: Record<string, string>;
    bodyAttributes?: Record<string, string>;
}


/** What a `head` resolver receives: the route being served / the plane being shown. */
export interface PluridDocumentContext {
    route: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
    planeID?: string;
    parentPlaneID?: string;
}


export type PluridDocumentResolver<C = PluridDocumentContext> = (
    context: C,
) => PluridDocument | undefined | Promise<PluridDocument | undefined>;


/** A static document or a resolver of one (async resolvers run on the server only). */
export type PluridDocumentSource<C = PluridDocumentContext> =
    | PluridDocument
    | PluridDocumentResolver<C>;
// #endregion module
