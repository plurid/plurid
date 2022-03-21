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
        PluridPlaneComponentProperty,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import { AppState } from '~kernel-services/state/store';
    import StateContext from '~kernel-services/state/context';
    import selectors from '~kernel-services/state/selectors';
    // import actions from '~kernel-services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledNotFound,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface NotFoundOwnProperties {
    plurid: PluridPlaneComponentProperty;
}

export interface NotFoundStateProperties {
    stateGeneralTheme: Theme;
    stateGeneralNotFoundFace: string;
}

export interface NotFoundDispatchProperties {
}

export type NotFoundProperties =
    & NotFoundOwnProperties
    & NotFoundStateProperties
    & NotFoundDispatchProperties;

const NotFound: React.FC<NotFoundProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateGeneralTheme,
        stateGeneralNotFoundFace,
        // #endregion state
    } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledNotFound
            theme={stateGeneralTheme}
        >
            <h1>
                {stateGeneralNotFoundFace}
            </h1>

            <p>
                you searched and it's not here
            </p>
        </StyledNotFound>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): NotFoundStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateGeneralNotFoundFace: selectors.general.getNotFoundFace(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): NotFoundDispatchProperties => ({
});


const ConnectedNotFound = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(NotFound);
// #endregion module



// #region exports
export default ConnectedNotFound;
// #endregion exports
