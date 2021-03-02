// #region imports
    // #region libraries
    import React from 'react';

    import {
        Store,
        AnyAction,
    } from 'redux';
    import {
        Provider as ReduxProvider,
    } from 'react-redux';

    import {
        PluridApplication as PluridApplicationProperties,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        AppState,
    } from '~services/state/store';
    import StateContext from '~services/state/context';

    import PluridView from '~Application/View';
    // #endregion external
// #endregion imports



// #region module
export interface PluridRootProperties {
    store: Store<AppState, AnyAction>;
    pluridApplication: PluridApplicationProperties;
}

const PluridRoot: React.FC<PluridRootProperties> = (
    properties,
) => {
    /** properties */
    const {
        store,
        pluridApplication,
    } = properties;


    /** render */
    return (
        <ReduxProvider
            store={store}
            context={StateContext}
        >
            <PluridView
                application={pluridApplication}
            />
        </ReduxProvider>
    );
}
// #endregion module



// #region exports
export default PluridRoot;
// #endregion exports
