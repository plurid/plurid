// #region imports
    // #region libraries
    import React, {
        useSyncExternalStore,
        useLayoutEffect,
        useRef,
    } from 'react';

    import {
        PluridDocument,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        generalEngine,
    } from '~services/engine';

    import {
        PluridDocumentRegistry,
    } from '~services/document/registry';
    // #endregion external
// #endregion imports



// #region module
const {
    resolveTitle,
    documentKey,
    safeJSON,
    DOCUMENT_ELEMENT_ATTRIBUTE,
} = generalEngine.document;


export interface PluridDocumentHeadProperties {
    registry: PluridDocumentRegistry;
}


/** One head element the document wants: keyed, with a selector to ADOPT a pre-existing one. */
interface HeadElementSpec {
    key: string;
    tag: string;
    attributes: Record<string, string | undefined>;
    content?: string;
    /** An unmanaged element to adopt (a static `index.html` tag, a server-serialized one). */
    adopt?: string;
}

const attributeSelector = (
    name: string,
    value: string,
): string => '[' + name + '="' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]';

const headElements = (
    document: PluridDocument,
): HeadElementSpec[] => {
    const elements: HeadElementSpec[] = [];

    if (document.base) {
        elements.push({
            key: 'base',
            tag: 'base',
            attributes: { href: document.base.href, target: document.base.target },
            adopt: 'base',
        });
    }

    const title = resolveTitle(document);
    if (title !== undefined) {
        elements.push({
            key: 'title',
            tag: 'title',
            attributes: {},
            content: title,
            adopt: 'title',
        });
    }

    const meta = [...(document.meta ?? [])].sort((a, b) => (
        (a.charset !== undefined ? 0 : 1) - (b.charset !== undefined ? 0 : 1)
    ));
    for (const item of meta) {
        const identity = item.charset !== undefined
            ? 'meta[charset]'
            : item.name
                ? 'meta' + attributeSelector('name', item.name)
                : item.property
                    ? 'meta' + attributeSelector('property', item.property)
                    : item.httpEquiv
                        ? 'meta' + attributeSelector('http-equiv', item.httpEquiv)
                        : item.itemProp
                            ? 'meta' + attributeSelector('itemprop', item.itemProp)
                            : undefined;
        elements.push({
            key: 'meta:' + documentKey.meta(item),
            tag: 'meta',
            attributes: {
                charset: item.charset,
                name: item.name,
                property: item.property,
                'http-equiv': item.httpEquiv,
                itemprop: item.itemProp,
                content: item.content,
                media: item.media,
            },
            adopt: identity
                ? identity + (item.media ? attributeSelector('media', item.media) : ':not([media])')
                : undefined,
        });
    }

    for (const link of document.links ?? []) {
        const { precedence, ...attributes } = link;
        const rel = link.rel;
        let adopt: string | undefined;
        if (rel === 'canonical' || rel === 'manifest' || rel === 'mask-icon') {
            adopt = 'link' + attributeSelector('rel', rel);
        } else if (rel === 'icon' || rel === 'shortcut icon' || rel === 'apple-touch-icon') {
            adopt = 'link' + attributeSelector('rel', rel) + (link.sizes ? attributeSelector('sizes', link.sizes) : ':not([sizes])');
        } else if (rel === 'alternate') {
            adopt = 'link' + attributeSelector('rel', rel)
                + (link.hreflang ? attributeSelector('hreflang', link.hreflang) : ':not([hreflang])')
                + (link.type ? attributeSelector('type', link.type) : ':not([type])');
        } else if (link.href) {
            adopt = 'link' + attributeSelector('rel', rel) + attributeSelector('href', link.href);
        }
        elements.push({
            key: 'link:' + documentKey.link(link),
            tag: 'link',
            attributes: {
                ...attributes,
                ...(precedence ? { 'data-precedence': precedence } : {}),
            },
            adopt,
        });
    }

    for (const style of document.styles ?? []) {
        const key = 'style:' + documentKey.style(style);
        if (style.content === undefined && style.href) {
            elements.push({
                key,
                tag: 'link',
                attributes: { rel: 'stylesheet', href: style.href, media: style.media, 'data-precedence': style.precedence },
                adopt: 'link[rel="stylesheet"]' + attributeSelector('href', style.href),
            });
            continue;
        }
        elements.push({
            key,
            tag: 'style',
            attributes: { id: style.id, media: style.media, 'data-precedence': style.precedence },
            content: style.content ?? '',
            adopt: style.id ? 'style' + attributeSelector('id', style.id) : undefined,
        });
    }

    for (const script of document.scripts ?? []) {
        if (script.placement === 'body') {
            continue;
        }
        elements.push({
            key: 'script:' + documentKey.script(script),
            tag: 'script',
            attributes: {
                id: script.id,
                src: script.src,
                async: script.async ? '' : undefined,
                defer: script.defer ? '' : undefined,
                type: script.type,
                nonce: script.nonce,
            },
            content: script.content,
            adopt: script.src
                ? 'script' + attributeSelector('src', script.src)
                : script.id
                    ? 'script' + attributeSelector('id', script.id)
                    : undefined,
        });
    }

    (document.jsonLd ?? []).forEach((data, index) => {
        elements.push({
            key: 'jsonld:' + documentKey.jsonLd(data, index),
            tag: 'script',
            attributes: { type: 'application/ld+json' },
            content: safeJSON(data),
        });
    });

    return elements;
};


interface ManagedElement {
    element: HTMLElement;
    /** Created by the document (removed when withdrawn) or adopted (restored when withdrawn). */
    created: boolean;
    original?: { attributes: Record<string, string>; content: string };
}

const withdraw = (
    managed: ManagedElement,
) => {
    const { element, created, original } = managed;
    if (created) {
        element.remove();
        return;
    }
    if (original) {
        for (const name of Array.from(element.getAttributeNames())) {
            if (!(name in original.attributes)) {
                element.removeAttribute(name);
            }
        }
        for (const [name, value] of Object.entries(original.attributes)) {
            element.setAttribute(name, value);
        }
        if (element.tagName !== 'LINK' && element.tagName !== 'META' && element.tagName !== 'BASE') {
            element.textContent = original.content;
        }
    }
    element.removeAttribute(DOCUMENT_ELEMENT_ATTRIBUTE);
};


/**
 * The ONE renderer of the merged document on the client. It renders nothing into the React tree:
 * the head is reconciled imperatively — each wanted element is adopted when it already exists
 * (a static `index.html` tag, a server-serialized one, so there is never a second `<title>` or a
 * duplicated `<meta>`) or created, tagged `data-plurid-document="<key>"`, updated in place, and
 * withdrawn (removed, or restored to what it was) when the document drops it or the scope unmounts.
 * `lang` / `dir` / `htmlAttributes` / `bodyAttributes` are applied to the live `<html>` / `<body>`
 * and restored the same way. The server serializes the same snapshot into its template.
 */
const PluridDocumentHead: React.FC<PluridDocumentHeadProperties> = ({
    registry,
}) => {
    const document = useSyncExternalStore(
        registry.subscribe,
        registry.snapshot,
        registry.snapshot,
    );

    const managed = useRef(new Map<string, ManagedElement>());
    const previousAttributes = useRef<{ html: Map<string, string | null>; body: Map<string, string | null> }>({
        html: new Map(),
        body: new Map(),
    });

    useLayoutEffect(() => {
        if (typeof window === 'undefined' || registry.server) {
            return undefined;
        }
        const head = window.document.head;
        const wanted = headElements(document);
        const wantedKeys = new Set(wanted.map((spec) => spec.key));

        // withdraw what is no longer wanted
        for (const [key, entry] of [...managed.current.entries()]) {
            if (!wantedKeys.has(key)) {
                withdraw(entry);
                managed.current.delete(key);
            }
        }

        for (const spec of wanted) {
            let entry = managed.current.get(spec.key);
            if (!entry) {
                const marked = head.querySelector('[' + DOCUMENT_ELEMENT_ATTRIBUTE + '="' + spec.key + '"]') as HTMLElement | null;
                const adoptable = !marked && spec.adopt
                    ? (Array.from(head.querySelectorAll(spec.adopt)) as HTMLElement[])
                        .find((candidate) => !candidate.hasAttribute(DOCUMENT_ELEMENT_ATTRIBUTE))
                    : null;
                const existing = marked ?? adoptable ?? null;
                if (existing) {
                    const attributes: Record<string, string> = {};
                    for (const name of existing.getAttributeNames()) {
                        attributes[name] = existing.getAttribute(name) ?? '';
                    }
                    entry = {
                        element: existing,
                        created: false,
                        original: { attributes, content: existing.textContent ?? '' },
                    };
                } else {
                    const element = window.document.createElement(spec.tag);
                    head.appendChild(element);
                    entry = { element, created: true };
                }
                managed.current.set(spec.key, entry);
            }

            const { element } = entry;
            for (const [name, value] of Object.entries(spec.attributes)) {
                if (value === undefined) {
                    if (element.hasAttribute(name)) {
                        element.removeAttribute(name);
                    }
                } else if (element.getAttribute(name) !== value) {
                    element.setAttribute(name, value);
                }
            }
            if (spec.content !== undefined && element.textContent !== spec.content) {
                element.textContent = spec.content;
            }
            if (element.getAttribute(DOCUMENT_ELEMENT_ATTRIBUTE) !== spec.key) {
                element.setAttribute(DOCUMENT_ELEMENT_ATTRIBUTE, spec.key);
            }
        }

        // a second <title> (a static one next to the adopted one) is never left behind
        const titles = Array.from(head.querySelectorAll('title'));
        const owned = managed.current.get('title')?.element;
        if (owned) {
            for (const title of titles) {
                if (title !== owned && !title.hasAttribute(DOCUMENT_ELEMENT_ATTRIBUTE)) {
                    title.remove();
                }
            }
        }

        // html / body attributes, with what they replaced
        const apply = (
            element: HTMLElement,
            desired: Record<string, string>,
            memory: Map<string, string | null>,
        ) => {
            for (const [name, value] of Object.entries(desired)) {
                if (!memory.has(name)) {
                    memory.set(name, element.getAttribute(name));
                }
                if (element.getAttribute(name) !== value) {
                    element.setAttribute(name, value);
                }
            }
            for (const [name, original] of [...memory.entries()]) {
                if (name in desired) {
                    continue;
                }
                if (original === null) {
                    element.removeAttribute(name);
                } else {
                    element.setAttribute(name, original);
                }
                memory.delete(name);
            }
        };
        const html: Record<string, string> = { ...document.htmlAttributes };
        if (document.lang) html.lang = document.lang;
        if (document.dir) html.dir = document.dir;
        apply(window.document.documentElement, html, previousAttributes.current.html);
        apply(window.document.body, { ...document.bodyAttributes }, previousAttributes.current.body);

        return undefined;
    }, [registry, document]);

    useLayoutEffect(() => () => {
        if (typeof window === 'undefined') {
            return;
        }
        for (const entry of managed.current.values()) {
            withdraw(entry);
        }
        managed.current.clear();
        const restore = (element: HTMLElement, memory: Map<string, string | null>) => {
            for (const [name, original] of memory) {
                if (original === null) {
                    element.removeAttribute(name);
                } else {
                    element.setAttribute(name, original);
                }
            }
            memory.clear();
        };
        restore(window.document.documentElement, previousAttributes.current.html);
        restore(window.document.body, previousAttributes.current.body);
    }, []);

    return null;
};
// #endregion module



// #region exports
export default PluridDocumentHead;
// #endregion exports
