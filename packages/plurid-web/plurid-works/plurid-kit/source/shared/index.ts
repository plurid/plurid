// #region imports
    // #region internal
    import type {
        ServerOnly,
        PluridServiceConfig,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * Resolve a {@link ServerOnly} value: call the thunk if given one, await the
 * result, and unwrap a `{ default }` ES-module namespace (so
 * `() => import('./preserves')` works). A non-thunk value is returned as-is.
 */
export async function resolveServerOnly<T>(
    value: ServerOnly<T> | undefined,
): Promise<T | undefined> {
    if (typeof value !== 'function') {
        return value;
    }

    const produced = await (value as () => T | Promise<T> | Promise<{ default: T }>)();

    if (
        produced
        && typeof produced === 'object'
        && 'default' in (produced as Record<string, unknown>)
    ) {
        return (produced as { default: T }).default;
    }

    return produced as T;
}


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
