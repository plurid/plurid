// #region imports
    // #region libraries
    import React, {
        useContext,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        planes,
    } from '@plurid/plurid-engine';
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
    // #endregion external


    // #region internal
    import {
        StyledPluridPlanePreview,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    getPlanesRegistrar,
} = planes;



export interface PluridPlanePreviewOwnProperties {
    planeID: string;
    linkCoordinates: PluridLinkCoordinates;
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
        planeID,
        linkCoordinates,
        // #endregion own

        // #region state
        stateGeneralTheme,
        // stateInteractionTheme,
        // #endregion state
    } = properties;
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

    const plane = planesRegistry.get(planeID);
    // #endregion context


    // #region render
    if (!plane) {
        return (<></>);
    }

    const Component = plane.component;

    if (typeof Component !== 'function') {
        return (<></>);
    }

    return (
        <StyledPluridPlanePreview
            theme={stateGeneralTheme}
            linkCoordinates={linkCoordinates}
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
