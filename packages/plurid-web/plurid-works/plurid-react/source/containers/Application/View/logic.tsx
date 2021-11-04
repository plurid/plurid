// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridApplicationView,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import PluridPlanesView from '~containers/Application/View/PlanesView';
    // import PluridErrorView from '~containers/Application/View/ErrorView';
    // #endregion external
// #endregion imports



// #region module
const handleView = (
    view: PluridApplicationView,
): JSX.Element => {
    if (view.length === 0) {
        // return (
        //     <PluridErrorView
        //         error="the plurid' application must contain a view"
        //     />
        // );
        return (<></>);
    }

    return (
        <PluridPlanesView />
    );
}
// #endregion module



// #region exports
export default handleView;
// #endregion exports
