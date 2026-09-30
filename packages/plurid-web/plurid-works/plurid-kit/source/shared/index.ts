// #region imports
    // #region libraries
    import {
        PluridApplicationProvider,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region internal
    import {
        SERVER_ONLY,
    } from '../index';
    import type {
        ServerOnly,
        PluridConfig,
        PluridServiceConfig,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * THE APPLICATION SURFACE, AS A SERVICE.
 *
 * `config.application` carries the render slots, persistence and observation
 * that `<PluridApplication …/>` takes directly and the route-driven path could
 * not forward. It reaches both targets as an ordinary service provider, which
 * is deliberate: services are the ONE thing the kit already composes in an
 * identical sequence on the server and the client, and a provider present on
 * one target and not the other is a hydration mismatch by construction.
 *
 * `order: -Infinity` puts it outermost, above the router and every application
 * the router constructs. A config that declares nothing adds no service and
 * pays no wrapper.
 */
export function applicationService(
    application: Record<string, unknown> | undefined,
): PluridServiceConfig[] {
    if (!application || Object.keys(application).length === 0) {
        return [];
    }

    return [{
        name: 'plurid-application',
        Provider: PluridApplicationProvider,
        properties: application,
        order: -Infinity,
    } as PluridServiceConfig];
}


/**
 * THE ROUTER, AS THE SERVER RENDERED IT.
 *
 * The server hands `PluridServer` the routes, planes, exterior, shell and
 * hostname, and its `PluridRouterStatic` renders `PluridRouterBrowser` with
 * them, `routerProperties` spread last. The client must hand the router the
 * same, or it hydrates a different tree: 2026-09-29 it passed no hostname, so
 * every plane's route read `plurid://<location.host>/…` where the server had
 * written `plurid://<hostname>/…`, and React threw the server's page away.
 */
export function routerProperties(
    config: PluridConfig,
): Record<string, unknown> {
    return {
        routes: routesOf(config),
        planes: config.planes || [],
        exterior: config.exterior,
        shell: config.shell,
        // the server's: `options` is merged over the derived options, so its hostname wins there too
        hostname: config.options?.hostname || config.hostname,
        ...(config.routerProperties || {}),
    };
}


/**
 * The path of the not-found route: the server's default (`PLURID_SERVER_NOT_FOUND_ROUTE` renames it
 * there, and only there) and the browser router's.
 */
export const NOT_FOUND_PATH = '/not-found';


/**
 * The routes both targets render: the config's, plus a `notFound` component as the not-found route
 * (unless the routes have one). The server renders it for every unknown URL (with a 404) and the
 * browser router falls back to it, so both must be handed it, or the page does not hydrate.
 * `notFound` was never read (2026-09-29).
 */
export function routesOf(
    config: PluridConfig,
): PluridConfig['routes'] {
    const routes = config.routes || [];
    const notFound = config.notFound;
    if (
        !notFound
        || typeof notFound === 'string'
        || routes.some((route) => route.value === NOT_FOUND_PATH)
    ) {
        return routes;
    }

    return [
        ...routes,
        {
            value: NOT_FOUND_PATH,
            exterior: notFound,
        },
    ];
}


/** The window globals the server preserve / template emit and the client reads once. */
export const PRELOADED_REDUX_STATE_KEY = '__PRELOADED_REDUX_STATE__';
export const PRELOADED_PLURID_METASTATE_KEY = '__PRELOADED_PLURID_METASTATE__';

/** Whether `value` is a thunk marked with `serverOnly`. */
export const isServerOnlyThunk = (
    value: unknown,
): boolean => typeof value === 'function'
    && (value as unknown as Record<symbol, unknown>)[SERVER_ONLY] === true;


/** A `{ default }` ES-module namespace unwrapped (so `() => import('./preserves')` works). */
const unwrapDefault = <T>(
    produced: unknown,
): T => (
    produced
    && typeof produced === 'object'
    && 'default' in (produced as Record<string, unknown>)
        ? (produced as { default: T }).default
        : produced as T
);


const callThunk = async <T>(
    thunk: unknown,
): Promise<T> => unwrapDefault<T>(
    await (thunk as () => T | Promise<T> | Promise<{ default: T }>)(),
);


/**
 * Resolve a {@link ServerOnly} value that is never itself a function (`preserves`, `load`): a
 * function is its thunk — called, awaited, a `{ default }` module unwrapped. A value is returned as-is.
 */
export async function resolveServerOnly<T>(
    value: ServerOnly<T> | undefined,
): Promise<T | undefined> {
    if (typeof value !== 'function') {
        return value;
    }

    return callThunk<T>(value);
}


/**
 * Resolve a {@link ServerOnly} value that IS a function (`document`, `handlers`): only a thunk marked
 * with `serverOnly` is called; a bare function is the value. The two were told apart by their number of
 * parameters, so a context-free hook (`document: () => ({ meta })`) was called at startup as a thunk,
 * its object became the hook, and every request failed (2026-09-29).
 */
export async function resolveServerOnlyFunction<T extends (...args: any[]) => unknown>(
    value: ServerOnly<T> | undefined,
): Promise<T | undefined> {
    if (!isServerOnlyThunk(value)) {
        return value as T | undefined;
    }

    return callThunk<T>(value);
}


/**
 * The function a lazy import produced — the value itself, or a module's `default` — else `undefined`.
 * What an unmarked thunk of a function-valued field (`handlers: () => import('./handlers')`, written
 * before `serverOnly`) hands back when it is called as the function.
 */
export const producedFunction = (
    value: unknown,
): ((...args: any[]) => unknown) | undefined => {
    if (typeof value === 'function') {
        return value as (...args: any[]) => unknown;
    }
    const inner = value && typeof value === 'object'
        ? (value as { default?: unknown }).default
        : undefined;
    return typeof inner === 'function'
        ? inner as (...args: any[]) => unknown
        : undefined;
};


/**
 * Compute the provider props for one service on a given target.
 *
 * Both targets spread the static `properties`, then `context` (Redux), then the
 * `store` built by the factory:
 *  - SERVER: `store(undefined)` is a base placeholder; the matching preserve
 *    overrides it per request (ContentGenerator merges `providers[name]` over
 *    these properties).
 *  - CLIENT: `store(preloadedState)` rebuilds the store from the serialized
 *    `window.__PRELOADED_REDUX_STATE__`.
 */
export function serviceProperties(
    service: PluridServiceConfig,
    target: 'server' | 'client',
    preloadedState?: unknown,
): Record<string, unknown> {
    const properties: Record<string, unknown> = {
        ...service.properties,
    };

    if (service.context !== undefined) {
        properties.context = service.context;
    }

    if (service.store) {
        properties.store = target === 'server'
            ? service.store(undefined)
            : service.store(preloadedState);
    }

    return properties;
}


/**
 * Order services by an optional `order` (lower = applied first = outer wrap),
 * falling back to array order. Stable.
 */
export function orderedServices(
    services: PluridServiceConfig[] = [],
): PluridServiceConfig[] {
    return services
        .map((service, index) => ({ service, index }))
        .sort((a, b) => {
            const orderA = a.service.order ?? a.index;
            const orderB = b.service.order ?? b.index;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return a.index - b.index;
        })
        .map((entry) => entry.service);
}
// #endregion module
