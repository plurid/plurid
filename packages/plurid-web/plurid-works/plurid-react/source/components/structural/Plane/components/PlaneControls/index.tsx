// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import { Theme } from '@plurid/plurid-themes';

    import {
        /** constants */
        PLURID_ENTITY_PLANE_CONTROLS,

        /** interfaces */
        RegisteredPluridPlane,
        TreePlane,
        PluridConfiguration,
    } from '@plurid/plurid-data';

    // import {
    //     universal,
    // } from '@plurid/plurid-ui-components-react';

    import {
        PluridIconArrowLeft,
        PluridIconFrame,
        // PluridIconCopy,
        // PluridIconLink,
        PluridIconDelete,
    } from '@plurid/plurid-icons-react';

    import {
        clipboard,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';

    import {
        navigateToPluridPlane,
    } from '~services/logic/animation';
    // #endregion external


    // #region internal
    // import SearchList from './components/SearchList';
    import ControlRefresh from './components/ControlRefresh';
    import ControlIsolate from './components/ControlIsolate';

    import {
        StyledPluridPlaneControls,
        StyledPluridPlaneControlsLeft,
        StyledPluridPlaneControlsCenter,
        StyledPluridPlaneControlsRight,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
// const {
//     inputs: {
//         Textline: PluridTextline,
//     },
// } = universal;

export interface PluridPlaneControlsOwnProperties {
    plane: RegisteredPluridPlane<PluridReactComponent>;
    treePlane: TreePlane;
    parentTreePlane: TreePlane | undefined;
    mouseOver: boolean;

    refreshPlane: () => void;
    isolatePlane: () => void;
    closePlane: () => void;
}

export interface PluridPlaneControlsStateProperties {
    configuration: PluridConfiguration;
    stateGeneralTheme: Theme;
    stateInteractionTheme: Theme;
    stateIsolatePlane: string;
}

export interface PluridPlaneControlsDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
}

export type PluridPlaneControlsProperties = PluridPlaneControlsOwnProperties
    & PluridPlaneControlsStateProperties
    & PluridPlaneControlsDispatchProperties;


const PluridPlaneControls: React.FC<PluridPlaneControlsProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        plane,
        treePlane,
        parentTreePlane,
        mouseOver,

        refreshPlane,
        isolatePlane,
        closePlane,
        // #endregion own

        // #region state
        configuration,
        stateGeneralTheme,
        // stateInteractionTheme,
        stateIsolatePlane,
        // #endregion state

        // #region dispatch
        dispatch,
        // #endregion dispatch
    } = properties;

    const {
        global,
        elements,
    } = configuration;

    const {
        transparentUI,
    } = global;

    const {
        pathbar,
    } = elements.plane.controls;

    const {
        planeID,
        route,
        routeDivisions
    } = treePlane;

    const {
        protocol,
        host,
    } = routeDivisions;

    const gateway = 'gateway';

    const gatewayAddress = `${protocol}://${host.value}/${gateway}?plurid=` + encodeURIComponent(route);

    const isolated = stateIsolatePlane === planeID;
    // #endregion properties


    // #region state
    const [path, setPath] = useState(treePlane.route);
    const [showAddress, setShowAddress] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    // #endregion state


    // #region handlers
    const onPathInput = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setPath(event.target.value);

        if (pathbar.onChange) {
            // const id = plane.id || plane.path;
            const id = plane.route.absolute;
            pathbar.onChange(event, id);
        }
    }

    const handleOnKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (!showSearch) {
            setShowSearch(true);
        }

        if (event.key === 'Escape') {
            setShowSearch(false);
        }

        if (pathbar.onKeyDown) {
            // const id = plane.id || plane.path;
            const id = plane.route.absolute;
            pathbar.onKeyDown(event, id);
        }
    }

    const copyGatewayLink = () => {
        clipboard.copy(gatewayAddress);
    }
    // #endregion handlers


    // #region render
    return (
        <StyledPluridPlaneControls
            theme={stateGeneralTheme}
            mouseOver={mouseOver}
            transparentUI={transparentUI}
            data-plurid-entity={PLURID_ENTITY_PLANE_CONTROLS}
        >
            <StyledPluridPlaneControlsLeft>
                {parentTreePlane && (
                    <PluridIconArrowLeft
                        atClick={(event) => {
                            navigateToPluridPlane(
                                dispatch,
                                parentTreePlane,
                                event,
                            );
                        }}
                        theme={stateGeneralTheme}
                        title="back"
                    />
                )}

                <PluridIconFrame
                    atClick={(event) => {
                        const deisolate = false;

                        navigateToPluridPlane(
                            dispatch,
                            treePlane,
                            event,
                            deisolate,
                        );
                    }}
                    theme={stateGeneralTheme}
                    title="focus"
                />

                <ControlRefresh
                    theme={stateGeneralTheme}
                    refreshPlane={refreshPlane}
                />

                <ControlIsolate
                    theme={stateGeneralTheme}
                    isolated={isolated}
                    isolatePlane={isolatePlane}
                />
            </StyledPluridPlaneControlsLeft>

            <StyledPluridPlaneControlsCenter>
                {path}

                {/* <PluridTextline
                    theme={stateInteractionTheme}
                    // text={showAddress ? gatewayAddress : path}
                    // text={treePlane.route}
                    text={path}
                    atChange={onPathInput}
                    atKeyDown={handleOnKeyDown}
                    ariaLabel="Plurid Pathbar"
                /> */}

                {/* {showSearch && (
                    <SearchList
                        hideSearch={() => setShowSearch(false)}
                    />
                )} */}
            </StyledPluridPlaneControlsCenter>

            <StyledPluridPlaneControlsRight>
                {/* <PluridIconCopy
                    atClick={() => copyGatewayLink()}
                />

                <PluridIconLink
                    atClick={() => setShowAddress(show => !show)}
                /> */}

                <PluridIconDelete
                    atClick={() => {
                        closePlane();
                    }}
                    theme={stateGeneralTheme}
                    title="close"
                />
            </StyledPluridPlaneControlsRight>
        </StyledPluridPlaneControls>
    );
    // #endregion render
}


const mapStateToProps = (
    state: AppState,
): PluridPlaneControlsStateProperties => ({
    configuration: selectors.configuration.getConfiguration(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateInteractionTheme: selectors.themes.getInteractionTheme(state),
    stateIsolatePlane: selectors.space.getIsolatePlane(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneControlsDispatchProperties => ({
    dispatch,
});


const ConnectedPluridPlaneControls = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridPlaneControls);
// #endregion module



// #region exports
export default ConnectedPluridPlaneControls;
// #endregion exports
