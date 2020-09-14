import React from 'react';

import PluridPlanesView from '../../modules/containers/PlanesView';
import PluridErrorView from '../../modules/containers/ErrorView';

import {
    PluridPlane,
} from '@plurid/plurid-data';



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


export default handleView;
