// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries


    // #region external
    import PluridProviderContext from '~containers/Provider/context';
    // #endregion external
// #endregion imports



// #region module
export const loadStateFromContext = (
    context: React.ContextType<typeof PluridProviderContext>,
    space: string | undefined,
) => {
    if (!context) {
        return;
    }

    if (!space) {
        if (typeof window === 'undefined') {
            return;
        }

        const defaultContext = context.states[window.location.pathname];
        return defaultContext;
    }

    return context.states[space];
}
// #endregion module
