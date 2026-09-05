// #region imports
    // #region libraries
    import React from 'react';

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
const text = (
    children: React.ReactNode,
): string => {
    let result = '';
    React.Children.forEach(children, (child) => {
        if (typeof child === 'string' || typeof child === 'number') {
            result += String(child);
        }
    });
    return result;
};

const inner = (
    props: Record<string, any>,
): string => props.dangerouslySetInnerHTML?.__html ?? text(props.children);

const attributes = (
    props: Record<string, any>,
    skip: string[] = [],
): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(props)) {
        if (key === 'children' || key === 'dangerouslySetInnerHTML' || skip.includes(key)) {
            continue;
        }
        if (value === undefined || value === null || value === false) {
            continue;
        }
        result[key === 'className' ? 'class' : key] = value === true ? '' : String(value);
    }
    return result;
};


/**
 * Helmet-style children (`<title>`, `<meta>`, `<link>`, `<script>`, `<style>`, `<base>`,
 * `<noscript>`, `<html>`, `<body>`) parsed into a document descriptor, so a component written as
 * `<PluridDocument><title>…</title><meta … /></PluridDocument>` is a one-line migration from `<Helmet>`.
 */
export const documentFromChildren = (
    children: React.ReactNode,
): PluridDocument => {
    const document: PluridDocument = {};
    const meta: PluridDocumentMeta[] = [];
    const links: PluridDocumentLink[] = [];
    const scripts: PluridDocumentScript[] = [];
    const styles: PluridDocumentStyle[] = [];
    const noscript: string[] = [];
    const jsonLd: Array<Record<string, unknown>> = [];

    const visit = (node: React.ReactNode) => {
        React.Children.forEach(node, (child) => {
            if (!React.isValidElement(child)) {
                return;
            }
            const props = (child.props ?? {}) as Record<string, any>;
            if (child.type === React.Fragment) {
                visit(props.children);
                return;
            }
            if (typeof child.type !== 'string') {
                return;
            }

            switch (child.type) {
                case 'title':
                    document.title = text(props.children);
                    break;
                case 'meta':
                    meta.push({
                        name: props.name,
                        property: props.property,
                        httpEquiv: props.httpEquiv ?? props['http-equiv'],
                        charset: props.charSet ?? props.charset,
                        itemProp: props.itemProp ?? props.itemprop,
                        content: props.content,
                        media: props.media,
                    });
                    break;
                case 'link':
                    links.push(attributes(props) as PluridDocumentLink);
                    break;
                case 'script': {
                    const content = inner(props);
                    if (props.type === 'application/ld+json') {
                        try {
                            jsonLd.push(JSON.parse(content));
                        } catch {
                            scripts.push({ type: props.type, content, id: props.id });
                        }
                        break;
                    }
                    scripts.push({
                        id: props.id,
                        src: props.src,
                        async: !!props.async,
                        defer: !!props.defer,
                        type: props.type,
                        nonce: props.nonce,
                        content: content || undefined,
                        placement: props['data-placement'] === 'body' ? 'body' : undefined,
                    });
                    break;
                }
                case 'style':
                    styles.push({
                        id: props.id,
                        href: props.href,
                        media: props.media,
                        precedence: props.precedence,
                        content: inner(props),
                    });
                    break;
                case 'base':
                    document.base = { href: props.href, target: props.target };
                    break;
                case 'noscript':
                    noscript.push(inner(props));
                    break;
                case 'html': {
                    const record = attributes(props);
                    if (record.lang !== undefined) {
                        document.lang = record.lang;
                        delete record.lang;
                    }
                    if (record.dir !== undefined) {
                        document.dir = record.dir as PluridDocument['dir'];
                        delete record.dir;
                    }
                    if (Object.keys(record).length > 0) {
                        document.htmlAttributes = { ...document.htmlAttributes, ...record };
                    }
                    break;
                }
                case 'body': {
                    const record = attributes(props);
                    if (Object.keys(record).length > 0) {
                        document.bodyAttributes = { ...document.bodyAttributes, ...record };
                    }
                    break;
                }
                default:
                    break;
            }
        });
    };
    visit(children);

    if (meta.length > 0) document.meta = meta;
    if (links.length > 0) document.links = links;
    if (scripts.length > 0) document.scripts = scripts;
    if (styles.length > 0) document.styles = styles;
    if (noscript.length > 0) document.noscript = noscript;
    if (jsonLd.length > 0) document.jsonLd = jsonLd;

    return document;
};
// #endregion module
