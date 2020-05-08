import React from 'react';

import PlanesView from '../../modules/containers/PlanesView';
import ErrorView from '../../modules/containers/ErrorView';

import {
    PluridPlane,
} from '@plurid/plurid-data';



const handleView = (
    planes: PluridPlane[] | undefined,
): JSX.Element => {
    if (planes) {
        return (
            <PlanesView />
        );
    }

    return (
        <ErrorView
            error="the plurid' application must contain planes"
        />
    );
}


export default handleView;
