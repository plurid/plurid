import React from 'react';

import {
    PluridApplication,
} from '@plurid/plurid-data';

import {
    computeApplication,
} from '../computing';

import PluridSpace from '../../../components/PluridSpace';



const renderStatic = (
    data: PluridApplication,
) => {
    const {
        planes,
        indexedPlanes,
        configuration,
        view,
    } = data;

    const {
        computedTree,
        indexedPlanesReference,
        planesPropertiesReference,
        appConfiguration,
    } = computeApplication(
        indexedPlanes,
        planes,
        configuration,
        view,
    );

    console.log('computedTree', computedTree)
    console.log('indexedPlanesReference', indexedPlanesReference)
    console.log('planesPropertiesReference', planesPropertiesReference)
    // console.log('appConfiguration', appConfiguration)


    /** render */
    return (
        <PluridSpace
            computedTree={computedTree}
            indexedPlanesReference={indexedPlanesReference}
            planesPropertiesReference={planesPropertiesReference}
            appConfiguration={appConfiguration}
        />
    );
};


export default renderStatic;
