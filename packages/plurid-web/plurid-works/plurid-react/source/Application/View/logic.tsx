// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridPlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import PluridPlanesView from '~containers/PlanesView';
    import PluridErrorView from '~containers/ErrorView';
    // #endregion external
// #endregion imports



// #region module
const handleView = (
    planes: PluridPlane[] | undefined,
): JSX.Element => {
    if (planes) {
        return (
            <PluridPlanesView />
        );
    }

    return (
        <PluridErrorView
            error="the plurid' application must contain planes"
        />
    );
}
// #endregion module



// #region exports
export default handleView;
// #endregion exports
