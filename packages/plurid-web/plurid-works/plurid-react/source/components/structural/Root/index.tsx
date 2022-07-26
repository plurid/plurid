// #region imports
    // #region libraries
    import React, {
        useContext,
        useMemo,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        /** constants */
        PLURID_ENTITY_ROOT,

        /** interfaces */
        TreePlane,
        PluridPlaneComponentProperty,
    } from '@plurid/plurid-data';

    import {
        planes,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import PluridPlane from '~components/structural/Plane';

    import Context from '~services/context';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    // import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';

    import {
        isReactRenderable,
    } from '~services/utilities/react';
    // #endregion external


    // #region internal
    import {
        StyledPluridRoot,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    getPlanesRegistrar,
    getRegisteredPlane,
} = planes;


export interface PluridRootOwnProperties {
    plane: TreePlane;
}

export interface PluridRootStateProperties {
}

export interface PluridRootDispatchProperties {
}

export type PluridRootProperties =
    & PluridRootOwnProperties
    & PluridRootStateProperties
    & PluridRootDispatchProperties;


const PluridRoot: React.FC<PluridRootProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        plane,
        // #endregion own
    } = properties;

    const {
        location,
    } = plane;
    // #endregion properties


    // #region context
    const context = useContext(Context);
    if (!context) {
        return (<></>);
    }

    const {
        planesRegistrar,
        planeContext: PlaneContext,
        planeContextValue,
        customPlane,
        matchedRoute,

        defaultPubSub,
    } = context;

    const CustomPluridPlane = customPlane as any; // hack
    // #endregion context


    // #region handlers
    const computeChildrenPlanes = (
        plane: TreePlane,
    ) => {
        // console.log('computeChildrenPlanesMemo', JSON.stringify(plane));
        if (!plane.children || plane.children.length === 0) {
            return [];
        }

        const children: JSX.Element[] = [];
        const planesRegistry = getPlanesRegistrar(planesRegistrar);

        plane.children.forEach(child => {
            // console.log('child', child);

            if (!planesRegistry) {
                return;
            }

            const planeID = child.sourceID;
            // console.log('planeID', planeID);
            const activePlane = planesRegistry.get(planeID);
            // console.log('activePlane', activePlane);

            if (
                activePlane
                // && pluridPlaneProperties
                // && child.show
            ) {
                const renderPlane = () => {
                    // instead of forcing show here to pass it as prop
                    // and change the opacity
                    const Plane = activePlane.component as any; // HACK

                    const pluridProperty: PluridPlaneComponentProperty = {
                        plane: {
                            value: activePlane.route.absolute,
                            planeID: child.planeID,
                            parentPlaneID: child.parentPlaneID,
                            fragments: activePlane.route.fragments,
                            parameters: activePlane.route.parameters,
                            query: activePlane.route.query,
                        },
                        route: {
                            value: matchedRoute?.match.value || '',
                            parameters: matchedRoute?.match.parameters || {},
                            query: matchedRoute?.match.query || {},
                        },
                        pubSub: defaultPubSub,
                    };
                    const properties = {
                        plurid: {
                            ...pluridProperty,
                        },
                        key: 'plurid-plane-' + child.planeID,
                    };

                    const renderablePlane = isReactRenderable(Plane);
                    const renderableCustomPlane = isReactRenderable(CustomPluridPlane);
                    const keyBase = 'plurid-plane-child-';
                    const planeProperties = {
                        key: keyBase + child.planeID,
                        plane: activePlane,
                        treePlane: child,
                        planeID: child.planeID,
                        location: child.location,
                    };

                    if (CustomPluridPlane && renderableCustomPlane) {
                        return (
                            <CustomPluridPlane
                                {...planeProperties}
                            />
                        )
                    }

                    if (renderablePlane) {
                        return (
                            <PluridPlane
                                {...planeProperties}
                            >
                                {!PlaneContext
                                    ? (
                                        <Plane
                                            {...properties}
                                        />
                                    ) : (
                                        <PlaneContext.Provider
                                            value={planeContextValue}
                                        >
                                            <Plane
                                                {...properties}
                                            />
                                        </PlaneContext.Provider>
                                    )
                                }
                            </PluridPlane>
                        );
                    }

                    return (<></>);
                }

                const plane = renderPlane();
                children.push(plane);
            }

            if (child.children) {
                const childrenPlanes = computeChildrenPlanes(child);
                if (childrenPlanes) {
                    children.push(...childrenPlanes);
                }
            }
        });

        return children;
    }
    // #endregion handlers


    // #region effects
    const childrenPlanes = useMemo<JSX.Element[]>(
        () => computeChildrenPlanes(plane),
        [
            JSON.stringify(plane),
        ],
    );
    // #endregion effects


    // #region render
    const pluridPlaneID = plane.sourceID;
    // console.log('Root pluridPlaneID', pluridPlaneID);
    if (!pluridPlaneID) {
        return (
            <></>
        );
    }

    const pluridPlane = getRegisteredPlane(
        pluridPlaneID,
        planesRegistrar,
    );
    // console.log('Root pluridPlane', pluridPlane);
    if (!pluridPlane) {
        return (
            <></>
        );
    }

    const Plane: any = pluridPlane.component;
    // if (typeof Plane !== 'function') {
    //     return (<></>);
    // }
    // console.log('Root Plane', Plane);


    const pluridProperty: PluridPlaneComponentProperty = {
        plane: {
            value: pluridPlane.route.absolute,
            planeID: plane.planeID,
            parentPlaneID: plane.parentPlaneID,
            fragments: pluridPlane.route.fragments,
            parameters: pluridPlane.route.parameters,
            query: pluridPlane.route.query,
        },
        route: {
            value: matchedRoute?.match.value || '',
            parameters: matchedRoute?.match.parameters || {},
            query: matchedRoute?.match.query || {},
        },
        pubSub: defaultPubSub,
    };
    const planeProperties = {
        plurid: {
            ...pluridProperty,
        },
        key: 'plurid-plane-' + plane.planeID,
    };
    // console.log('Root planeProperties', planeProperties);


    if (CustomPluridPlane) {
        if (typeof CustomPluridPlane !== 'function') {
            return (<></>);
        }

        return (
            <StyledPluridRoot
                data-plurid-entity={PLURID_ENTITY_ROOT}
            >
                <CustomPluridPlane
                    plane={pluridPlane}
                    treePlane={plane}
                    planeID={plane.planeID}
                    location={location}
                />

                {childrenPlanes}
            </StyledPluridRoot>
        );
    }

    return (
        <StyledPluridRoot
            data-plurid-entity={PLURID_ENTITY_ROOT}
        >
            <PluridPlane
                plane={pluridPlane}
                treePlane={plane}
                planeID={plane.planeID}
                location={location}
            >
                {!PlaneContext
                    ? (
                        <Plane
                            {...planeProperties}
                        />
                    ) : (
                        <PlaneContext.Provider
                            value={planeContextValue}
                        >
                            <Plane
                                {...planeProperties}
                            />
                        </PlaneContext.Provider>
                    )
                }
            </PluridPlane>

            {childrenPlanes}
        </StyledPluridRoot>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridRootStateProperties => ({
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridRootDispatchProperties => ({
});


const ConnectedPluridRoot = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridRoot);
// #endregion module



// #region exports
export default ConnectedPluridRoot;
// #endregion exports
