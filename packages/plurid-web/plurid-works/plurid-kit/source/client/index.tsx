// #region imports
    // #region libraries
    import {
        createElement,
        Fragment,
        type ReactNode,
    } from 'react';

    import {
        hydrateRoot,
    } from 'react-dom/client';

    import {
        HelmetProvider,
    } from 'react-helmet-async';

    import {
        PluridProvider,
        PluridRouterBrowser,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region internal
    import type {
        PluridConfig,
    } from '../index';

    import {
        serviceProperties,
        orderedServices,
    } from '../shared';
    // #endregion internal
// #endregion imports



// #region module
/**
 * Read a preloaded `window` global once and delete it (so it is not re-read on
 * client navigations and not left dangling on the global object).
 */
function readPreloaded<T = unknown>(
    key: string,
): T | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }

    const value = (window as Record<string, any>)[key];
    delete (window as Record<string, any>)[key];

    return value;
}


/**
 * Hydrate a plurid app in the browser from the same `plurid.config.ts`. Replaces
 * every app's hand-written `source/client/{index,Client}.tsx`.
 *
 * Composes the provider stack with the IDENTICAL algorithm the server uses
 * (plurid-react-server `ContentGenerator`): innermost is
 * `PluridProvider > PluridRouterBrowser`, wrapped by `HelmetProvider`, then each
 * service wrapped OUTWARD in `services` order. Context providers emit no DOM, so
 * the hydrated markup matches the server render exactly.
 *
 * Per-request state comes from the globals the server preserve emitted:
 *  - `__PRELOADED_REDUX_STATE__`  -> the service `store` factory
 *  - `__PRELOADED_PLURID_METASTATE__` -> `PluridProvider metastate`
 */
export function createPluridClient(
    config: PluridConfig,
): void {
    const reduxState = readPreloaded('__PRELOADED_REDUX_STATE__');
    const pluridMetastate = readPreloaded('__PRELOADED_PLURID_METASTATE__');

    // Build each service's provider element once (the store is created a single
    // time here, equivalent to the previous `useRef(reduxStore(state))`).
    const services = orderedServices(config.services).map((service) => ({
        Provider: service.Provider,
        properties: serviceProperties(service, 'client', reduxState),
    }));

    const root = config.root || 'root';
    const helmetContext = config.helmet ?? {};

    const App = () => {
        // innermost: PluridProvider > PluridRouterBrowser
        let tree: ReactNode = createElement(
            PluridProvider,
            // metastate is untyped runtime data deserialized from the window global
            { metastate: pluridMetastate } as any,
            createElement(PluridRouterBrowser, {
                shell: config.shell,
                routes: config.routes,
                ...(config.routerProperties || {}),
            } as any),
        );

        // wrap with HelmetProvider (matches the server's inner Helmet wrap)
        tree = createElement(
            HelmetProvider,
            { context: helmetContext },
            tree,
        );

        // wrap each service OUTWARD, in the same order the server applies them
        for (const service of services) {
            tree = createElement(service.Provider, service.properties, tree);
        }

        return createElement(Fragment, null, tree);
    };

    const application = document.getElementById(root);
    if (!application) {
        throw new Error(
            `[plurid-kit] createPluridClient: root element #${root} not found.`,
        );
    }

    hydrateRoot(application, createElement(App));
}
// #endregion module
