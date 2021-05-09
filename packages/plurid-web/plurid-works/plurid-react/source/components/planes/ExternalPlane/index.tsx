// #region imports
    // #region libraries
    import React, {
        useRef,
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

    import ElementQLClient, {
        useElementQL,
    } from '@plurid/elementql-client-react';
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
                    path,
                }),
                credentials: 'include',
            },
        );
        // console.log('response', response);

        const data = await response.json();
        // console.log('data', data);

        if (!data.element) {
            return;
        }

        const {
            element,
        } = data;

        const elementQLClient = new ElementQLClient({
            url: element.url,
        });

        const {
            status,
            Elements,
        }: any = await elementQLClient.get(
            element.json,
            'json',
        );

        if (!status) {
            return;
        }

        const Element = Elements[element.name];

        return Element;
    } catch (error) {
        // console.log('error', error);

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


    // #region references
    const mounted = useRef(false);
    // #endregion references


    // #region state
    const [
        Component,
        setComponent,
    ] = useState<React.FC<any> | null>();
    // #endregion state


    // #region effects
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    });

    useEffect(() => {
        let loading = false;

        const load = async () => {
            // TOFIX - load only once
            if (loading) {
                return;
            }
            loading = true;

            try {
                // console.log('ExternalPlane > plurid', plurid);

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

                const Component = await elementRequest(
                    url,
                    pttpPath,
                );

                if (!mounted.current) {
                    return;
                }

                if (Component) {
                    setComponent(Component);
                }
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
