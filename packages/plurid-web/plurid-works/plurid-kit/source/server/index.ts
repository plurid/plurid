// #region imports
    // #region libraries
    import fs from 'fs';
    import path from 'path';

    import {
        createElement,
        type ComponentType,
    } from 'react';

    import {
        renderToStaticMarkup,
    } from 'react-dom/server';

    import {
        ServerStyleSheet,
    } from 'styled-components';
    // #endregion libraries


    // #region external
    import PluridServer from '@plurid/plurid-react-server';

    import type {
        PluridServerService,
        PluridServerPartialOptions,
        PluridServerTemplateConfiguration,
        PluridServerDocumentHook,
        PluridPreserveReact,
        PluridDocument,
    } from '@plurid/plurid-react-server';
    // #endregion external


    // #region internal
    import type {
        PluridConfig,
    } from '../index';

    import {
        resolveServerOnly,
        resolveServerOnlyFunction,
        producedFunction,
        serviceProperties,
        orderedServices,
        applicationService,
        routesOf,
    } from '../shared';

    import {
        validateConfig,
        validateResolved,
    } from './validate';
    // #endregion internal
    import {
        resolvePaths,
    } from '../cli/paths';
// #endregion imports



// #region module
/**
 * Read `build/asset-manifest.json` (written by `plurid build`) for the real
 * emitted client entry path. Returns `undefined` if absent (e.g. before a build
 * or in development), so the template falls back to the runtime default.
 */
function readAssetManifest(
    manifestPath: string,
): { main?: string } | undefined {
    try {
        const raw = fs.readFileSync(manifestPath, 'utf8');
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
}


const warned = new Set<string>();

/** One warning per message per process. */
const warnOnce = (
    message: string,
) => {
    if (warned.has(message)) {
        return;
    }
    warned.add(message);
    console.warn(message);
};


/**
 * `styles` in the head: an href is a `<link rel="stylesheet">` in the lowest document layer (they were
 * concatenated raw into the page, where `'/global.css'` rendered as visible text and loaded nothing,
 * 2026-09-29); a string that starts with `<` is markup, which the server writes as it is.
 */
const splitStyles = (
    styles: string[] = [],
) => {
    const links = styles
        .filter((style) => !style.trimStart().startsWith('<'))
        .map((href) => ({ rel: 'stylesheet', href }));
    const markup = styles.filter((style) => style.trimStart().startsWith('<'));

    return {
        links,
        markup,
    };
};


/** A page file under the public directory (`notFound: '/404.html'`), read once at startup. */
const readPublicPage = (
    field: string,
    file: string,
    publicRoot: string,
) => {
    const location = path.join(publicRoot, file);
    try {
        return fs.readFileSync(location, 'utf8');
    } catch (error) {
        throw new Error(
            `[plurid-kit] \`${field}: '${file}'\` is not a readable file under the public directory (${location})`,
            { cause: error },
        );
    }
};


/**
 * A component rendered ONCE to a static page (its styled-components styles collected): the 500 page is
 * served when rendering has failed, so it is rendered before anything can, with no request and no script.
 */
const renderStaticPage = (
    Component: ComponentType,
    language = 'en',
) => {
    const sheet = new ServerStyleSheet();
    try {
        const markup = renderToStaticMarkup(sheet.collectStyles(createElement(Component)));
        const styles = sheet.getStyleTags();
        return '<!DOCTYPE html>'
            + `<html lang="${language.replace(/[^A-Za-z0-9-]/g, '')}">`
            + '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
            + styles
            + '</head>'
            + `<body>${markup}</body>`
            + '</html>';
    } finally {
        sheet.seal();
    }
};


/**
 * `document`: a bare function IS the hook. One written before `serverOnly` as a lazy import
 * (`document: () => import('./document')`) hands back its module when called with the context: the
 * hook it produced is used from then on, and it is said once how to mark it.
 */
const documentHookOf = (
    value: PluridServerDocumentHook | undefined,
): PluridServerDocumentHook | undefined => {
    if (!value) {
        return undefined;
    }

    let produced: PluridServerDocumentHook | undefined;
    return async (context) => {
        if (produced) {
            return produced(context);
        }

        const result = await value(context);
        const hook = producedFunction(result) as PluridServerDocumentHook | undefined;
        if (!hook) {
            return result;
        }

        warnOnce(
            '[plurid-kit] `document` returned a module instead of a document: mark a lazy import, '
            + '`document: serverOnly(() => import(\'./document\'))` (the function itself is the hook).',
        );
        produced = hook;
        return hook(context);
    };
};


/**
 * Build a configured `PluridServer` from a `plurid.config.ts`. Replaces every
 * app's hand-written `source/server/index.ts`.
 *
 * Server-only fields (`preserves`, `load`, `handlers`, `middleware`) are read
 * from the passed config object; the thin server entry spreads them in
 * (`createPluridServer({ ...config, preserves, handlers })`) so they never enter
 * `plurid.config.ts` and never leak into the client bundle.
 *
 * The config is validated first: every problem is reported, with the shape
 * expected, before a server exists.
 */
export async function createPluridServer(
    config: PluridConfig,
): Promise<PluridServer> {
    validateConfig(config);

    // Services: project each PluridServiceConfig to a PluridServerService with a
    // base store (the preserve overrides it per request). Order is preserved so
    // the client can wrap providers in the identical sequence.
    const services: PluridServerService[] = orderedServices([
        ...applicationService(config.application as any),
        ...(config.services || []),
    ]).map(
        (service) => ({
            name: service.name,
            Provider: service.Provider,
            properties: serviceProperties(service, 'server'),
        }),
    );

    // Preserves: resolve any server-only thunk, then append the `load` sugar.
    const resolvedPreserves = await resolveServerOnly(config.preserves) ?? [];
    validateResolved('preserves', resolvedPreserves, Array.isArray(resolvedPreserves), 'an array of preserves');
    const resolvedLoad = await resolveServerOnly(config.load);
    validateResolved('load', resolvedLoad, resolvedLoad === undefined || (!!resolvedLoad && typeof resolvedLoad === 'object'), 'a preserve');
    const preserves: PluridPreserveReact[] = resolvedLoad
        ? [...resolvedPreserves, resolvedLoad]
        : resolvedPreserves;

    const document = await resolveServerOnlyFunction(config.document);
    validateResolved('document', document, document === undefined || typeof document === 'function', 'a document hook (a function)');
    const handlers = await resolveServerOnlyFunction(config.handlers);
    validateResolved('handlers', handlers, handlers === undefined || typeof handlers === 'function', 'a function of the server');

    const isProduction = process.env.ENV_MODE === 'production'
        || process.env.NODE_ENV === 'production';

    // In production, point the template at the REAL emitted client entry (from
    // `plurid build`'s asset manifest).
    const paths = resolvePaths(config);
    const productionScripts = isProduction ? readAssetManifest(paths.assetManifest) : undefined;

    // Options: identity + directories. `publicDirectory` defaults to
    // `source/public` in development so favicons resolve; the raw `options`
    // escape hatch wins.
    // the one path resolution (C13): the build directory the CLI wrote, the public directory it copied
    const defaultPublicDirectory = isProduction
        ? '' // -> <buildDirectory>/public (resolved by the runtime)
        : paths.publicDir;

    const options: PluridServerPartialOptions = {
        serverName: config.serverName,
        hostname: config.hostname,
        buildDirectory: paths.buildDir,
        publicDirectory: isProduction && !config.publicDir ? defaultPublicDirectory : paths.publicDir,
        ...config.options,
    };
    // the directory the server serves at `/`, where the error pages' files are
    const publicRoot = options.publicDirectory
        || path.join(options.buildDirectory || paths.buildDir, 'public');

    const styles = splitStyles(config.styles);
    const head: PluridDocument | undefined = styles.links.length > 0
        ? {
            ...config.head,
            links: [
                ...(config.head?.links || []),
                ...styles.links,
            ],
        }
        : config.head;

    // The error pages (`notFound`, `errorPage`): never read before 2026-09-29. A `notFound` component is
    // a route (`routesOf`, on both targets); a file is the 404 page; the 500 page is a file or a
    // component rendered once, here.
    const notFoundHtml = typeof config.notFound === 'string'
        ? readPublicPage('notFound', config.notFound, publicRoot)
        : undefined;
    const errorHtml = typeof config.errorPage === 'string'
        ? readPublicPage('errorPage', config.errorPage, publicRoot)
        : config.errorPage
            ? renderStaticPage(config.errorPage as ComponentType, config.head?.lang)
            : undefined;

    // Template: fold head / favicon / manifest (P1 batteries) + root + script
    // sources, with the raw `template` escape hatch winning.
    const template: PluridServerTemplateConfiguration = {
        root: config.root,
        favicon: config.favicon,
        manifest: config.manifest,
        head,
        // The framework always emits a SINGLE client bundle (no separate vendor
        // chunk) in BOTH dev and prod, so skip the vendor `<script>` in both -
        // this is the `/vendor.js` 404 fix (dev included). The main script
        // defaults to `/index.js` (dev output) and is overridden by the asset
        // manifest's real emitted path in production.
        vendorScriptSource: '',
        ...(isProduction && productionScripts?.main
            ? { mainScriptSource: productionScripts.main }
            : {}),
        ...(notFoundHtml ? { notFoundHtml } : {}),
        ...(errorHtml ? { errorHtml } : {}),
        ...config.template,
    };

    if (Array.isArray(config.routes) && config.routes.length === 0 && !config.planes?.length) {
        warnOnce('[plurid-kit] the configuration has no routes: every page answers 404.');
    }

    // Custom Express routes (deon/defile/decart/status and PTTP CORS): `handlers(server)` runs INSIDE
    // the construction, before the page's catch-all `GET` — after it, its `GET /status` never
    // answered (2026-09-29).
    let handled: unknown;
    const server = new PluridServer({
        routes: routesOf(config),
        planes: config.planes,
        shell: config.shell,
        exterior: config.exterior,
        routerProperties: config.routerProperties,
        preserves,
        document: documentHookOf(document),
        render: config.render,
        styles: styles.markup,
        middleware: config.middleware,
        services,
        options,
        template,
        usePTTP: config.usePTTP ?? true,
        elementqlEndpoint: config.elementqlEndpoint,
        handlers: handlers
            ? (host) => {
                handled = handlers(host);
            }
            : undefined,
    });

    // `handlers: () => import('./handlers')`, written before `serverOnly`: called as the handlers, it
    // produced the module instead of registering. Its function runs now — after the construction, so
    // a `GET` it adds through `instance()` sits behind the page (`handle().get` does not) — and it is
    // said once how to mark it.
    const legacy = producedFunction(await handled);
    if (legacy) {
        warnOnce(
            '[plurid-kit] `handlers` returned a module instead of registering routes: mark a lazy import, '
            + '`handlers: serverOnly(() => import(\'./handlers\'))`, so it runs before the page\'s catch-all GET.',
        );
        await legacy(server);
    }

    return server;
}


/**
 * Convenience: create the server and start it on `process.env.PORT` (the value
 * the `plurid` CLI sets). The thin app's `source/server/index.ts` is then a
 * one-liner: `startPluridServer({ ...config, preserves, handlers })`.
 *
 * Resolves once the server is listening; rejects when it cannot (`EADDRINUSE`),
 * and the process then exits with the reason.
 */
export async function startPluridServer(
    config: PluridConfig,
): Promise<PluridServer> {
    const server = await createPluridServer(config);

    const port = process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : undefined;

    await server.start(port);

    return server;
}
// #endregion module
