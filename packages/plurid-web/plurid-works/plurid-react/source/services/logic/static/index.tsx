// #region imports
    // #region libraries
    import React from 'react';

    import {
        PLURID_ENTITY_VIEW,

        PluridApplication,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import {
        computeApplication,
    } from '../computing';

    import PluridSpace from '~components/structural/Space';

    import {
        GlobalStyle,
        StyledView,
    } from '~containers/Application/View/styled';
    // #endregion external
// #endregion imports



// #region module
const renderStatic = (
    data: PluridApplication<PluridReactComponent>,
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
// #endregion module



// #region exports
export default renderStatic;
// #endregion exports
