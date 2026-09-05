// #region imports
    // #region libraries
    import React from 'react';
    import {
        renderToString,
        renderToPipeableStream,
    } from 'react-dom/server';
    import {
        Writable,
    } from 'stream';
    import {
        ServerStyleSheet,
        StyleSheetManager,
    } from 'styled-components';

    import {
        PluridProvider,
        PluridRouterStatic,
        composePluridProviders,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        PluridRequestTreeData,
        PluridServerRenderMode,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
/**
 * The React tree of one request: the service providers (their static properties merged with the
 * preserve's per-request ones) around `PluridProvider` (with the request's document registry) around
 * the static router — composed with the same function the kit client uses for hydration.
 */
export const buildRequestTree = (
    data: PluridRequestTreeData,
): React.ReactElement => {
    const {
        services,
        preserveResult,
        pluridMetastate,
        documentRegistry,
        pathname,
        directPlane,
        routes,
        planes,
        exterior,
        shell,
        hostname,
        routerProperties,
    } = data;

    const application = (
        <PluridProvider
            metastate={pluridMetastate}
            documentRegistry={documentRegistry}
        >
            <PluridRouterStatic
                path={pathname}
                directPlane={directPlane}
                routes={routes}
                planes={planes}
                exterior={exterior}
                shell={shell}
                hostname={hostname}
                routerProperties={routerProperties}
            />
        </PluridProvider>
    );

    const layers = services.map((service) => ({
        name: service.name,
        Provider: service.Provider,
        properties: {
            ...service.properties,
            ...preserveResult?.providers?.[service.name],
        },
    }));

    return composePluridProviders(layers, application);
};


export interface RenderContentOptions {
    /** `'string'` (default) or `'suspense'` (buffered `renderToPipeableStream`, every boundary awaited). */
    mode?: PluridServerRenderMode;
    /** ms a `'suspense'` render may take before it is aborted. Default 10000. */
    timeout?: number;
}


/** A buffered pipeable render: resolves with the whole markup once every Suspense boundary settled. */
const renderBuffered = (
    element: React.ReactElement,
    timeout: number,
): Promise<string> => new Promise((resolve, reject) => {
    let html = '';
    let settled = false;
    let renderError: unknown;

    const finish = (error?: unknown) => {
        if (settled) {
            return;
        }
        settled = true;
        clearTimeout(timer);
        if (error) {
            reject(error);
        } else {
            resolve(html);
        }
    };

    const writable = new Writable({
        write(chunk, _encoding, callback) {
            html += chunk.toString();
            callback();
        },
        final(callback) {
            callback();
            finish(renderError);
        },
    });

    const timer = setTimeout(() => {
        stream.abort(new Error('render timeout'));
        finish(new Error(`[plurid-react-server] the suspense render exceeded ${timeout}ms`));
    }, timeout);

    const stream = renderToPipeableStream(element, {
        onAllReady() {
            stream.pipe(writable);
        },
        onShellError(error) {
            finish(error);
        },
        onError(error) {
            // A boundary error would degrade to a client re-render: the server is strict instead —
            // a failed render is a 500, never a half page (the same contract as the string mode).
            renderError = renderError ?? error;
        },
    });
});


/**
 * Render the request tree to markup plus its styled-components CSS. Throws on a render error,
 * so the request handler answers 500 (an empty `#root` with a 200 was the old behavior).
 */
export const renderContent = async (
    element: React.ReactElement,
    options: RenderContentOptions = {},
): Promise<{ content: string; styles: string }> => {
    const sheet = new ServerStyleSheet();

    try {
        const wrapped = (
            <StyleSheetManager
                sheet={sheet.instance}
            >
                {element}
            </StyleSheetManager>
        );
        const content = options.mode === 'suspense'
            ? await renderBuffered(wrapped, options.timeout ?? 10000)
            : renderToString(wrapped);
        const styles = sheet.getStyleTags();

        return {
            content,
            styles,
        };
    } finally {
        sheet.seal();
    }
};
// #endregion module
