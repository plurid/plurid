// #region imports
    // #region libraries
    import React from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridConfiguration,

        PLURID_ENTITY_TRANSFORM_ORIGIN,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledOrigin,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface OriginOwnProperties {
}

export interface OriginStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
    stateConfiguration: PluridConfiguration;
}

export interface OriginDispatchProperties {
}

export type OriginProperties =
    & OriginOwnProperties
    & OriginStateProperties
    & OriginDispatchProperties;


const Origin: React.FC<OriginProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateGeneralTheme,
        // stateInteractionTheme,
        stateConfiguration,
        // #endregion state
    } = properties;

    const {
        space,
    } = stateConfiguration;

    const {
        transformOrigin,
    } = space;

    const {
        show: showTransformOrigin,
        size: transformOriginSize,
    } = transformOrigin;
    // #endregion properties


    // #region render
    if (!showTransformOrigin) {
        return (<></>);
    }

    return (
        <StyledOrigin
            theme={stateGeneralTheme}
            size={transformOriginSize}
            data-plurid-entity={PLURID_ENTITY_TRANSFORM_ORIGIN}
        />
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): OriginStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
    stateConfiguration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): OriginDispatchProperties => ({
});


const ConnectedOrigin = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(Origin);
// #endregion module



// #region exports
export default ConnectedOrigin;
// #endregion exports
