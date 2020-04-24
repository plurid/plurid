import React from 'react';

import PlanesView from '../../modules/containers/PlanesView';
import UniversesView from '../../modules/containers/UniversesView';
import ErrorView from '../../modules/containers/ErrorView';

import {
    PluridPlane,
    PluridUniverse,
} from '@plurid/plurid-data';



const handleView = (
    planes: PluridPlane[] | undefined,
    // universes: PluridUniverse[] | undefined,
): JSX.Element => {
    if (planes) {
        return (
            <PlanesView />
        );
    }

    // if (planes && !universes) {
    //     return (
    //         <PlanesView />
    //     );
    // }

    // if (universes && !planes) {
    //     return (
    //         <UniversesView />
    //     );
    // }

    return (
        <ErrorView
            // error="the plurid' application must be either universes or planes-based"
            error="the plurid' application must contain planes-based"
        />
    );
}


export default handleView;
