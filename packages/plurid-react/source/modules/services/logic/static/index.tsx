import React from 'react';

import {
    PLURID_ENTITY_VIEW,

    PluridApplication,
} from '@plurid/plurid-data';

import {
    computeApplication,
} from '../computing';

import PluridSpace from '../../../components/PluridSpace';

import {
    GlobalStyle,
    StyledView,
} from '../../../../Application/View/styled';



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

    // console.log('computedTree', computedTree)
    // console.log('indexedPlanesReference', indexedPlanesReference)
    // console.log('planesPropertiesReference', planesPropertiesReference)
    // console.log('appConfiguration', appConfiguration)


    /** render */
    return (
        <StyledView
            tabIndex={0}
            transformMode={appConfiguration.space.transformMode}
            data-plurid-entity={PLURID_ENTITY_VIEW}
        >
            <GlobalStyle />

            <PluridSpace
                computedTree={computedTree}
                indexedPlanesReference={indexedPlanesReference}
                planesPropertiesReference={planesPropertiesReference}
                appConfiguration={appConfiguration}
            />
        </StyledView>
    );
};


export default renderStatic;
