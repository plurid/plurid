// #region imports
    // #region libraries
    import React, {
        useState,
        useContext,
        useEffect,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        /** constants */
        PLURID_ENTITY_ROOT,

        /** interfaces */
        TreePlane,
        PluridContext,
        PluridComponentProperty,
        PluridalWindow,
    } from '@plurid/plurid-data';

    import {
        getPlanesRegistrar,
        getRegisteredPlane,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import PluridPlane from '~components/structural/Plane';

    import Context from '~services/context';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridRoot,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
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


    // if (typeof indexedPlanesReference !== 'undefined') {
    //     const pluridPlaneID = plane.sourceID;
    //     if (!pluridPlaneID) {
    //         return (
    //             <></>
    //         );
    //     }

    //     const pluridPlane = indexedPlanesReference.get(pluridPlaneID);
    //     const pluridPlaneProperties = planesPropertiesReference.get(pluridPlaneID);

    //     if (!pluridPlane || !pluridPlaneProperties) {
    //         return (
    //             <></>
    //         );
    //     }

    //     if (pluridPlane.component.kind !== 'react') {
    //         return (
    //             <></>
    //         );
    //     }

    //     const Plane = pluridPlane.component.element;

    //     const pluridProperties: PluridProperty = {
    //         ...pluridPlaneProperties.plurid,
    //         metadata: {
    //             planeID: plane.planeID,
    //         },
    //     };

    //     const planeProperties = {
    //         ...pluridPlane.component.properties,
    //         plurid: {
    //             ...pluridProperties,
    //         },
    //     };

    //     // console.log(Plane, planeProperties, pluridPlane);

    //     // return (
    //     //     <div>
    //     //     </div>
    //     // );

    //     return (
    //         <StyledPluridRoot
    //             data-plurid-entity={PLURID_ENTITY_ROOT}
    //         >
    //             {/* <Plane /> */}

    //             <PluridPlane
    //                 plane={pluridPlane}
    //                 treePlane={plane}
    //                 planeID={plane.planeID}
    //                 location={location}
    //             >
    //                 <Plane
    //                     {...planeProperties}
    //                 />
    //             </PluridPlane>

    //             {/* <PluridPlane
    //                 plane={pluridPlane}
    //                 treePlane={plane}
    //                 planeID={plane.planeID}
    //                 location={location}
    //             >
    //                 <Plane
    //                     {...planeProperties}
    //                 />
    //                 {PlaneContext
    //                     ? (
    //                         <PlaneContext.Provider
    //                             value={planeContextValue}
    //                         >
    //                             <Plane
    //                                 {...planeProperties}
    //                             />
    //                         </PlaneContext.Provider>
    //                     ) : (
    //                         <Plane
    //                             {...planeProperties}
    //                         />
    //                     )
    //                 }
    //             </PluridPlane> */}

    //             {/* {childrenPlanes} */}
    //         </StyledPluridRoot>
    //     );
    // }


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
    } = context;

    const CustomPluridPlane = customPlane;
    // #endregion context


    // #region state
    const [
        childrenPlanes,
        setChildrenPlanes,
    ] = useState<JSX.Element[]>([]);
    // #endregion state


    // #region handlers
    const computeChildrenPlanes = (
        plane: TreePlane,
    ) => {
        // console.log('computeChildrenPlanes plane', plane);
        if (!plane.children) {
            return;
        }

        const planesRegistry = getPlanesRegistrar(planesRegistrar);

        plane.children.map(child => {
            // console.log('child', child);

            if (!planesRegistry) {
                return;
            }
            // if (!statePlaneSources || !planesMap) {
            //     return;
            // }

            const planeID = child.sourceID;
            // console.log('AAAAAA indexedPlanesSources', indexedPlanesSources);
            // console.log('planeID', planeID);
            if (!planeID) {
                return;
            }

            const activePlane = planesRegistry.get(planeID);
            // const pluridPlaneProperties = planesProperties.get(planeID);
            // console.log('activePlane', activePlane);
            // const activePlane = activePlanes[child.sourceID];

            let plane = (<></>);
            if (
                activePlane
                // && pluridPlaneProperties
                // && child.show
            ) {
                // instead of forcing show here to pass it as prop
                // and change the opacity
                const Plane = activePlane.component;

                const pluridProperty: PluridComponentProperty = {
                    route: {
                        value: activePlane.route.absolute,
                        // protocol: {
                        //     ...child.routeDivisions.protocol,
                        // },
                        // host: {
                        //     ...child.routeDivisions.host,
                        // },
                        // path: {
                        //     ...child.routeDivisions.path,
                        // },
                        // space: {
                        //     ...child.routeDivisions.space,
                        // },
                        // universe: {
                        //     ...child.routeDivisions.universe,
                        // },
                        // cluster: {
                        //     ...child.routeDivisions.cluster,
                        // },
                        // plane: {
                        //     ...child.routeDivisions.plane,
                        // },
                    },
                    metadata: {
                        planeID: child.planeID,
                        parentPlaneID: child.parentPlaneID,
                    },
                };

                const properties = {
                    // ...activePlane.component.properties,
                    plurid: {
                        ...pluridProperty,
                    },
                };

                plane = !CustomPluridPlane
                    ? (
                    <PluridPlane
                        key={child.planeID}
                        plane={activePlane}
                        treePlane={child}
                        planeID={child.planeID}
                        location={child.location}
                    >
                        {/* {!PlaneContext
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
                        } */}

                        <Plane
                            {...properties}
                        />
                    </PluridPlane>
                ) : (
                    <CustomPluridPlane
                        key={child.planeID}
                        plane={activePlane}
                        treePlane={child}
                        planeID={child.planeID}
                        location={child.location}
                    />
                );

                setChildrenPlanes(planes => [
                    ...planes,
                    plane,
                ]);
            }

            if (child.children) {
                computeChildrenPlanes(child);
            }
        });
    }
    // #endregion handlers


    // #region effects
    /** Compute children planes */
    useEffect(() => {
        // TODO: explore for optimizations
        // check if the plane is already in the array
        // or get a better dependency than the JSON stringification
        setChildrenPlanes([]);
        computeChildrenPlanes(plane);
    }, [
        JSON.stringify(plane),
    ]);
    // #endregion effects


    // #region render
    const pluridPlaneID = plane.sourceID;
    // const pluridPlaneID = statePlaneSources[plane.sourceID];
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
    // const pluridPlane = planesRegistry.get(pluridPlaneID);
    // const pluridPlaneProperties = planesProperties.get(pluridPlaneID);
    // console.log('Root pluridPlaneID', pluridPlaneID);
    // console.log('Root pluridPlane', pluridPlane);

    // if (!pluridPlane || !pluridPlaneProperties) {
    if (!pluridPlane) {
        return (
            <></>
        );
    }

    // if (pluridPlane.component.kind !== 'react') {
    //     return (
    //         <></>
    //     );
    // }

    const Plane = pluridPlane.component;
    // console.log('Root Plane', Plane);


    const pluridProperty: PluridComponentProperty = {
        route: {
            value: pluridPlane.route.absolute,
            // protocol: {
            //     ...plane.routeDivisions.protocol,
            // },
            // host: {
            //     ...plane.routeDivisions.host,
            // },
            // path: {
            //     ...plane.routeDivisions.path,
            // },
            // space: {
            //     ...plane.routeDivisions.space,
            // },
            // universe: {
            //     ...plane.routeDivisions.universe,
            // },
            // cluster: {
            //     ...plane.routeDivisions.cluster,
            // },
            // plane: {
            //     ...plane.routeDivisions.plane,
            // },
        },
        metadata: {
            planeID: plane.planeID,
            parentPlaneID: plane.parentPlaneID,
        },
    };

    const planeProperties = {
        // ...pluridPlane.component.properties,
        plurid: {
            ...pluridProperty,
        },
    };


    if (CustomPluridPlane) {
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
                {PlaneContext
                    ? (
                        <PlaneContext.Provider
                            value={planeContextValue}
                        >
                            <Plane
                                {...planeProperties}
                            />
                        </PlaneContext.Provider>
                    ) : (
                        <Plane
                            {...planeProperties}
                        />
                    )
                }

                {/* <Plane
                    {...planeProperties}
                /> */}
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
