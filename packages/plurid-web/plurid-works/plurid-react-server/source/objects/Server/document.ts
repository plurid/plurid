// #region imports
    // #region libraries
    import {
        PluridDocument,
        PluridDocumentContext,
        PluridDocumentSource,
        IsoMatcherRouteResult,
    } from '@plurid/plurid-data';

    import {
        general,
    } from '@plurid/plurid-engine';

    import {
        PluridReactComponent,
        PluridDocumentRegistry,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        PluridServerTemplateConfiguration,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const {
    mergeDocuments,
} = general.document;


/**
 * The template configuration as the LOWEST document layer: the favicon set, the manifest, the
 * static `head`, the html language and attributes. One document, one serializer — the old
 * string-built static head and its own escaper are gone.
 */
export const documentFromTemplate = (
    template: PluridServerTemplateConfiguration | undefined,
): PluridDocument => {
    if (!template) {
        return {};
    }

    const document: PluridDocument = {};
    const links: NonNullable<PluridDocument['links']> = [];
    const meta: NonNullable<PluridDocument['meta']> = [];

    const favicon = template.favicon;
    if (typeof favicon === 'string') {
        links.push({ rel: 'icon', href: favicon });
    } else if (favicon) {
        if (favicon.icon) {
            links.push({ rel: 'icon', href: favicon.icon });
        }
        if (favicon.apple) {
            links.push({ rel: 'apple-touch-icon', href: favicon.apple });
        }
        for (const [sizes, href] of Object.entries(favicon.sizes || {})) {
            links.push({ rel: 'icon', sizes, href });
        }
        if (favicon.maskIcon) {
            links.push({
                rel: 'mask-icon',
                href: favicon.maskIcon,
                ...(favicon.themeColor ? { color: favicon.themeColor } : {}),
            });
        }
        if (favicon.themeColor) {
            meta.push({ name: 'theme-color', content: favicon.themeColor });
        }
    }
    if (template.manifest) {
        links.push({ rel: 'manifest', href: template.manifest });
    }

    if (template.htmlLanguage) document.lang = template.htmlLanguage;
    if (template.htmlAttributes) document.htmlAttributes = { ...template.htmlAttributes };
    if (template.bodyAttributes) document.bodyAttributes = { ...template.bodyAttributes };
    if (links.length > 0) document.links = links;
    if (meta.length > 0) document.meta = meta;

    return mergeDocuments(document, template.head);
};


/** A `head` source resolved for a context (a static document, or a sync / async resolver). */
export const resolveDocumentSource = async (
    source: PluridDocumentSource | undefined,
    context: PluridDocumentContext,
): Promise<PluridDocument | undefined> => {
    if (!source) {
        return undefined;
    }
    if (typeof source === 'function') {
        return await source(context);
    }
    return source;
};


/** The matched route's (or route plane's) `head`, resolved before the render. */
export const resolveRouteDocument = async (
    match: IsoMatcherRouteResult<PluridReactComponent>,
): Promise<PluridDocument | undefined> => {
    const matched = match.match as unknown as {
        value: string;
        parameters?: Record<string, string>;
        query?: Record<string, string>;
    };
    const context: PluridDocumentContext = {
        route: matched.value,
        parameters: matched.parameters ?? {},
        query: matched.query ?? {},
    };

    return resolveDocumentSource(match.data.head, context);
};


export interface AssembleDocumentLayers {
    /** The template's document (favicon, manifest, static head): the lowest layer. */
    template?: PluridDocument;
    /** The request registry: the route's head, the shown planes' heads, the in-render declarations. */
    registry: PluridDocumentRegistry;
    /** The preserve's `document`. */
    preserve?: PluridDocument;
    /** The server `document` hook's result: the highest layer. */
    hook?: PluridDocument;
}


/** The precedence, lowest → highest: template → route → planes → in-render → preserve → hook. */
export const assembleDocument = (
    layers: AssembleDocumentLayers,
): PluridDocument => mergeDocuments(
    layers.template,
    layers.registry.snapshot(),
    layers.preserve,
    layers.hook,
);
// #endregion module
