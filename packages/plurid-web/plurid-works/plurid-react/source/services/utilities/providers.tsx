// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries
// #endregion imports



// #region module
export interface PluridProviderLayer {
    name?: string;
    Provider: React.ComponentType<any>;
    properties?: Record<string, unknown>;
}


/**
 * Nest provider layers around `children`: `layers[0]` is the INNERMOST (closest to the
 * application), the last layer the outermost — the one composition the server render and the
 * kit client share, so a service is wired identically on both sides.
 */
export const composePluridProviders = (
    layers: PluridProviderLayer[],
    children: React.ReactNode,
): React.ReactElement => {
    let element: React.ReactElement = <>{children}</>;
    for (const layer of layers) {
        element = (
            <layer.Provider
                {...(layer.properties ?? {})}
            >
                {element}
            </layer.Provider>
        );
    }
    return element;
};
// #endregion module
