// #region imports
    // #region libraries
    import React, {
        useContext,
        useMemo,
    } from 'react';
    // #endregion libraries


    // #region external
    import PluridDocumentRegistryContext from '~services/document/context';
    import {
        PluridDocumentRegistry,
        createDocumentRegistry,
    } from '~services/document/registry';
    // #endregion external


    // #region internal
    import PluridDocumentHead from './Head';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridDocumentScopeProperties {
    /** A registry to collect into (the server's per-request one); otherwise the scope creates its own. */
    registry?: PluridDocumentRegistry;
}


/**
 * Provides the document registry to everything below and, when THIS scope owns the registry (no
 * scope above it), renders the one `PluridDocumentHead` — so a bare `PluridApplication` and a
 * `PluridProvider` tree each get exactly one head renderer, never two.
 */
const PluridDocumentScope: React.FC<React.PropsWithChildren<PluridDocumentScopeProperties>> = ({
    registry,
    children,
}) => {
    const parent = useContext(PluridDocumentRegistryContext);
    const own = useMemo(
        () => parent ?? registry ?? createDocumentRegistry(),
        [parent, registry],
    );
    const owner = !parent;

    return (
        <PluridDocumentRegistryContext.Provider
            value={own}
        >
            {children}
            {owner && (
                <PluridDocumentHead
                    registry={own}
                />
            )}
        </PluridDocumentRegistryContext.Provider>
    );
};
// #endregion module



// #region exports
export default PluridDocumentScope;
// #endregion exports
