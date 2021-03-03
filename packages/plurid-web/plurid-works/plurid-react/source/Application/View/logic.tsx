// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridApplicationView,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import PluridPlanesView from '~containers/PlanesView';
    import PluridErrorView from '~containers/ErrorView';
    // #endregion external
// #endregion imports



// #region module
const handleView = (
    view: PluridApplicationView | undefined,
): JSX.Element => {
    if (view) {
        return (
            <PluridPlanesView />
        );
    }

    return (
        <PluridErrorView
            error="the plurid' application must contain a view"
        />
    );
}
// #endregion module



// #region exports
export default handleView;
// #endregion exports
