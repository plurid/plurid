// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledExternalPlane,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const getPttpUrl = (
    path: string,
) => {
    return '';
}

const getPttpPath = (
    path: string,
) => {
    return '';
}

const elementRequest = async (
    url: string,
    path: string,
) => {
    return '';
}


export interface ExternalPlaneOwnProperties {
}

export interface ExternalPlaneStateProperties {
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
}

export interface ExternalPlaneDispatchProperties {
}

export type ExternalPlaneProperties = ExternalPlaneOwnProperties
    & ExternalPlaneStateProperties
    & ExternalPlaneDispatchProperties;

const ExternalPlane: PluridReactComponent<ExternalPlaneProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            plurid,
            // #endregion values
        // #endregion required

        // #region state
        // stateGeneralTheme,
        // stateInteractionTheme,
        // #endregion state
    } = properties;

    const {
        route,
    } = plurid;
    // #endregion properties


    // #region state
    const [
        Component,
        setComponent,
    ] = useState<React.FC<any> | null>();
    // #endregion state


    // #region effects
    useEffect(() => {
        const load = async () => {
            try {
                console.log('ExternalPlane > plurid', plurid);

                // const pttpURL = getPttpUrl(route.path.value);
                // const pttpPath = getPttpPath(route.path.value);

                // const elementData = await elementRequest(
                //     pttpURL,
                //     pttpPath,
                // );

            } catch (error) {
                return;
            }
        }

        load();
    }, []);
    // #endregion effects


    // #region render
    return (
        <StyledExternalPlane>
            {Component && (
                <Component />
            )}
        </StyledExternalPlane>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): ExternalPlaneStateProperties => ({
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ExternalPlaneDispatchProperties => ({
});


const ConnectedExternalPlane = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(ExternalPlane);
// #endregion module



// #region exports
export default ConnectedExternalPlane;
// #endregion exports
