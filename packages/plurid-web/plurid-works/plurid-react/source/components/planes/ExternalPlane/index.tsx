// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import fetch from 'cross-fetch';

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
    // console.log('getPttpUrl path', path);
    const re = /^pttp:\/\/(\w+(\.|:)\w+)\/?/;
    const match = path.match(re);
    // console.log('getPttpUrl match', match);

    if (!match) {
        return {
            domain: '',
            url: '',
        };
    }

    const domain = match[1];
    const protocol = 'http';
    const url = `${protocol}://${domain}/pttp`
    return {
        domain,
        url,
    };
}

const getPttpPath = (
    domain: string,
    path: string,
) => {
    if (!domain) {
        return;
    }

    const pttpPath = path.replace(`pttp://${domain}`, '');

    return pttpPath;
}

const elementRequest = async (
    url: string,
    path: string,
) => {
    try {
        // console.log('elementRequest url', url);
        // console.log('elementRequest path', path);

        const response = await fetch(
            url,
            {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paths: [
                        path,
                    ],
                }),
            },
        );

        console.log('response', response);

        return '';
    } catch (error) {
        return;
    }
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

                const {
                    domain,
                    url,
                } = getPttpUrl(
                    route.value,
                );
                const pttpPath = getPttpPath(
                    domain,
                    route.value,
                );

                if (
                    !url
                    || !pttpPath
                ) {
                    return;
                }

                const elementData = await elementRequest(
                    url,
                    pttpPath,
                );

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
