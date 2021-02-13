// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridApplication as PluridApplicationProperties,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import store from '~services/state/store';
    // #endregion external


    // #region internal
    import Root from './Root';
    // #endregion internal
// #endregion imports



// #region module
const initialState = {};
const initializedStore = store(initialState);


const PluridSingleApplication: React.FC<PluridApplicationProperties> = (
    properties,
) => {
    return (
        <Root
            store={initializedStore}
            pluridApplication={{
                ...properties,
            }}
        />
    );
}
// #endregion module



// #region exports
export default PluridSingleApplication;
// #endregion exports
