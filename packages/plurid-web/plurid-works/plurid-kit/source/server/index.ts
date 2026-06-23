// #region imports
    // #region libraries
    import fs from 'fs';
    // #endregion libraries


    // #region external
    import PluridServer from '@plurid/plurid-react-server';

    import type {
        PluridServerService,
        PluridServerPartialOptions,
        PluridServerTemplateConfiguration,
        PluridPreserveReact,
    } from '@plurid/plurid-react-server';
    // #endregion external


    // #region internal
    import type {
        PluridConfig,
    } from '../index';

    import {
        resolveServerOnly,
        serviceProperties,
        orderedServices,
    } from '../shared';
    // #endregion internal
// #endregion imports



// #region module
/**
 * Read `build/asset-manifest.json` (written by `plurid build`) for the real
 * emitted client entry path. Returns `undefined` if absent (e.g. before a build
 * or in development), so the template falls back to the runtime default.
 */
function readAssetManifest(): { main?: string } | undefined {
    try {
        const raw = fs.readFileSync('build/asset-manifest.json', 'utf8');
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
}


/**
 * Build a configured `PluridServer` from a `plurid.config.ts`. Replaces every
 * app's hand-written `source/server/index.ts`.
 *
 * Server-only fields (`preserves`, `load`, `handlers`, `middleware`) are read
 * from the passed config object; the thin server entry spreads them in
 * (`createPluridServer({ ...config, preserves, handlers })`) so they never enter
 * `plurid.config.ts` and never leak into the client bundle.
 */
export async function createPluridServer(
    config: PluridConfig,
): Promise<PluridServer> {
    // Services: project each PluridServiceConfig to a PluridServerService with a
    // base store (the preserve overrides it per request). Order is preserved so
    // the client can wrap providers in the identical sequence.
    const services: PluridServerService[] = orderedServices(config.services).map(
        (service) => ({
            name: service.name,
            Provider: service.Provider,
            properties: serviceProperties(service, 'server'),
        }),
    );

    // Preserves: resolve any server-only thunk, then append the `load` sugar.
    const resolvedPreserves = await resolveServerOnly(config.preserves) ?? [];
    const resolvedLoad = await resolveServerOnly(config.load);
    const preserves: PluridPreserveReact[] = resolvedLoad
        ? [...resolvedPreserves, resolvedLoad]
        : resolvedPreserves;

    const isProduction = process.env.ENV_MODE === 'production'
        || process.env.NODE_ENV === 'production';

    // In production, point the template at the REAL emitted client entry (from
    // `plurid build`'s asset manifest).
    const productionScripts = isProduction ? readAssetManifest() : undefined;

    // Template: fold head / favicon / manifest (P1 batteries) + root + script
    // sources, with the raw `template` escape hatch winning.
    const template: PluridServerTemplateConfiguration = {
        root: config.root,
        favicon: config.favicon as PluridServerTemplateConfiguration['favicon'],
        manifest: config.manifest,
        head: config.head as PluridServerTemplateConfiguration['head'],
        // The framework always emits a SINGLE client bundle (no separate vendor
        // chunk) in BOTH dev and prod, so skip the vendor `<script>` in both -
        // this is the `/vendor.js` 404 fix (dev included). The main script
        // defaults to `/index.js` (dev output) and is overridden by the asset
        // manifest's real emitted path in production.
        vendorScriptSource: '',
        ...(isProduction && productionScripts?.main
            ? { mainScriptSource: productionScripts.main }
            : {}),
        ...config.template,
    };

    // Options: identity + directories. `publicDirectory` defaults to
    // `source/public` in development so favicons resolve; the raw `options`
    // escape hatch wins.
    const defaultPublicDirectory = isProduction
        ? '' // -> <buildDirectory>/public (resolved by the runtime)
        : (config.publicDir || 'source/public');

    const options: PluridServerPartialOptions = {
        serverName: config.serverName,
        hostname: config.hostname,
        buildDirectory: config.buildDir,
        publicDirectory: config.publicDir || defaultPublicDirectory,
        ...config.options,
    };

    const server = new PluridServer({
        routes: config.routes,
        planes: config.planes,
        shell: config.shell,
        exterior: config.exterior,
        routerProperties: config.routerProperties,
        customPlane: config.customPlane,
        helmet: (config.helmet ?? {}) as any,
        preserves,
        styles: config.styles,
        middleware: config.middleware,
        services,
        options,
        template,
        usePTTP: config.usePTTP ?? true,
        elementqlEndpoint: config.elementqlEndpoint,
    });

    // Custom Express routes (deon/defile/decart/status and PTTP CORS): the
    // server-only `handlers(server)` thunk, resolved and invoked once.
    const handlers = await resolveServerOnly(config.handlers);
    if (handlers) {
        handlers(server);
    }

    return server;
}


/**
 * Convenience: create the server and start it on `process.env.PORT` (the value
 * the `plurid` CLI sets). The thin app's `source/server/index.ts` is then a
 * one-liner: `startPluridServer({ ...config, preserves, handlers })`.
 */
export async function startPluridServer(
    config: PluridConfig,
): Promise<PluridServer> {
    const server = await createPluridServer(config);

    const port = process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : undefined;

    server.start(port);

    return server;
}
// #endregion module
