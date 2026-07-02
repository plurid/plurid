// #region imports
    // #region libraries
    import React, {
        useContext,
        useMemo,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        /** constants */
        PLURID_ENTITY_ROOT,

        /** interfaces */
        TreePlane,
        PluridPlaneComponentProperty,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import PluridPlane from '~components/structural/Plane';

    import Context from '~services/context';

    import PluridPlaneIDContext from '~services/hooks/plane/context';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';

    import {
        isReactRenderable,
    } from '~services/utilities/react';

    import {
        getPlanesRegistrar,
        getRegisteredPlane,
    } from '~services/engine';
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

// Intentionally empty: PluridRoot no longer subscribes to the whole tree. It renders from its
// `plane` ownProp (kept current by structural sharing), so it re-renders only when its OWN
// root subtree changes — not on every unrelated mutation (which previously forced new ownProps
// onto every child plane and defeated their memoization).
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
                            <PluridPlaneIDContext.Provider
                                key={keyBase + child.planeID}
                                value={child.planeID}
                            >
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
                            </PluridPlaneIDContext.Provider>
                        );
                    }

                    return (<></>);
                }

                // Named `renderedPlane` (not `plane`) so it doesn't shadow the `plane`
                // PARAMETER that `renderPlane` closes over.
                const renderedPlane = renderPlane();
                children.push(renderedPlane);
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
            // Just `plane`: the tree is rebuilt immutably + structurally shared, so this root's
            // node changes identity exactly when its OWN subtree changes — recomputing the
            // child elements only then (and keeping their references stable otherwise, so the
            // child planes can bail out of their own re-render).
            plane,
        ],
    );
    // #endregion effects


    // #region render
    const pluridPlaneID = plane.sourceID;
    // console.log('Root pluridPlaneID', pluridPlaneID);
    if (!pluridPlaneID) {
        return (<></>);
    }

    const pluridPlane = getRegisteredPlane(
        pluridPlaneID,
        planesRegistrar,
    );
    // console.log('Root pluridPlane', pluridPlane, pluridPlaneID, planesRegistrar);
    if (!pluridPlane) {
        return (<></>);
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
            <PluridPlaneIDContext.Provider
                value={plane.planeID}
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
            </PluridPlaneIDContext.Provider>

            {childrenPlanes}
        </StyledPluridRoot>
    );
    // #endregion render
}


const mapStateToProperties = (
    _state: AppState,
): PluridRootStateProperties => ({
    // No tree subscription — PluridRoot bails on unrelated mutations and re-renders only when
    // its `plane` ownProp (structurally shared) changes.
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridRootDispatchProperties => ({
});


// `React.memo` is REQUIRED, not redundant with `connect`: `<PluridRoots>` subscribes to the
// per-frame transform matrix, so it re-renders on every orbit frame and every spawn dispatch, and
// react-redux v9 `connect` re-runs the wrapped component on those parent renders unless it is
// memoized. With the tree structurally shared (`reconcileTree`), an unchanged root's `plane`
// ownProp is referentially stable, so `React.memo`'s shallow compare bails the re-render entirely.
const ConnectedPluridRoot = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(React.memo(PluridRoot));
// #endregion module



// #region exports
export default ConnectedPluridRoot;
// #endregion exports
