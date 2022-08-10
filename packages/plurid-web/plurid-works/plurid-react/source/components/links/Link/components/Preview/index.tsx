// #region imports
    // #region libraries
    import React, {
        useContext,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        PluridLinkCoordinates,
    } from '~data/interfaces';

    import Context from '~services/context';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';

    import {
        getPlanesRegistrar,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import {
        StyledPluridPlanePreview,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridPlanePreviewOwnProperties {
    planeRoute: string;
    linkCoordinates: PluridLinkCoordinates;
    previewOffsetX: number | undefined;
    previewOffsetY: number | undefined;
    previewComponent: any;
}

export interface PluridPlanePreviewStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface PluridPlanePreviewDispatchProperties {
}

export type PluridPlanePreviewProperties =
    & PluridPlanePreviewOwnProperties
    & PluridPlanePreviewStateProperties
    & PluridPlanePreviewDispatchProperties;


const PluridPlanePreview: React.FC<PluridPlanePreviewProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        planeRoute,
        linkCoordinates,
        previewComponent,
        previewOffsetX,
        previewOffsetY,
        // #endregion own

        // #region state
        stateGeneralTheme,
        // stateInteractionTheme,
        // #endregion state
    } = properties;

    const resolvedLinkCoordinates = {
        x: linkCoordinates.x + (previewOffsetX ?? 0),
        y: linkCoordinates.y + (previewOffsetY ?? 0),
    };
    // #endregion properties


    // #region context
    const context = useContext(Context);
    if (!context) {
        return (<></>);
    }

    const {
        planesRegistrar,
    } = context;

    const planesRegistry = getPlanesRegistrar(planesRegistrar);
    if (!planesRegistry) {
        return (<></>);
    }
    // #endregion context


    // #region render
    const plane = planesRegistry.get(planeRoute);
    if (!plane) {
        return (<></>);
    }

    const Component = previewComponent ?? plane.component;
    if (typeof Component !== 'function') {
        return (<></>);
    }

    return (
        <StyledPluridPlanePreview
            theme={stateGeneralTheme}
            linkCoordinates={resolvedLinkCoordinates}
        >
            <Component />
        </StyledPluridPlanePreview>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridPlanePreviewStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlanePreviewDispatchProperties => ({
});


const ConnectedPluridPlanePreview = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridPlanePreview);
// #endregion module



// #region exports
export default ConnectedPluridPlanePreview;
// #endregion exports
