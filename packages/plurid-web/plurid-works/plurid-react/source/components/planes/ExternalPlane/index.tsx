// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
        useEffect,
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
        PluridReactFunctionalComponent,
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
const isLoopback = (
    host: string,
) => host === 'localhost'
    || host.endsWith('.localhost')
    || host === '[::1]'
    || /^127(\.\d{1,3}){3}$/.test(host);

/**
 * The pttp endpoint of a `pttp://host[:port]/path` route. The host is the whole authority: the pattern
 * took one dot only, so `pttp://a.example.com/path` asked `a.example` for `.com/path`. The request
 * goes over the page's own transport, as an https page cannot fetch over http, and over http to this
 * machine; it was http always (2026-10-20).
 */
export const getPttpUrl = (
    path: string,
    pageProtocol = typeof window === 'undefined' ? 'http:' : window.location.protocol,
) => {
    // console.log('getPttpUrl path', path);
    const re = /^pttp:\/\/([^/?#]+)/;
    const match = path.match(re);
    // console.log('getPttpUrl match', match);

    if (!match) {
        return {
            domain: '',
            url: '',
        };
    }

    const domain = match[1];
    const protocol = pageProtocol === 'https:' && !isLoopback(domain.replace(/:\d+$/, ''))
        ? 'https'
        : 'http';
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

        // The ElementQL client is an OPTIONAL peer, loaded only when an external plane resolves.
        const { ElementQLClient } = await import('@plurid/elementql-client-react');
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

        return () => Element;
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

export type ExternalPlaneProperties =
    & ExternalPlaneOwnProperties
    & ExternalPlaneStateProperties
    & ExternalPlaneDispatchProperties;


const ExternalPlane: PluridReactFunctionalComponent<
    ExternalPlaneProperties
> = (
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

    // Registered as a plane, the component receives the plane's property; as a route's exterior, the
    // route's. It read the route's shape only, so as a plane it never asked for its element (2026-10-20).
    const route = 'plane' in plurid ? plurid.plane.value : plurid.value;
    // #endregion properties


    // #region references
    const mounted = useRef(false);
    const loadStarted = useRef(false);
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
        // Load exactly once per mounted instance: an effect-local flag resets on
        // StrictMode's simulated remount (each closure owns its own copy), so the
        // guard must live on a ref that survives it.
        if (loadStarted.current) {
            return;
        }
        loadStarted.current = true;

        const load = async () => {
            try {
                // console.log('ExternalPlane > plurid', plurid);

                const {
                    domain,
                    url,
                } = getPttpUrl(
                    route,
                );
                const pttpPath = getPttpPath(
                    domain,
                    route,
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
