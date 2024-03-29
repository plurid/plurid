// #region imports
    // #region libraries
    import React, {
        useContext,
        useRef,
        useState,
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
        Dispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        mathematics,
    } from '@plurid/plurid-functions';

    import {
        useDebouncedCallback,
    } from '@plurid/plurid-functions-react';

    import {
        PLURID_PUBSUB_TOPIC,
        FOCUS_ANCHOR_SUFFIX,
        PLURID_ENTITY_PLANE,

        RegisteredPluridPlane,
        TreePlane,
        TreePlaneLocation,
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import ErrorBoundary from '~components/utilities/ErrorBoundary';

    import Context from '~services/context';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    // import { ViewSize } from '~services/state/types/space';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import {
        DispatchAction,
    } from '~data/interfaces';

    import {
        cleanTemplate,
        space,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import {
        StyledPluridPlane,
        StyledFocusAnchor,
    } from './styled';

    import PlaneBridge from './components/PlaneBridge';
    import PlaneControls from './components/PlaneControls';
    import PlaneContent from './components/PlaneContent';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridPlaneOwnProperties {
    // #region required
        // #region values
        planeID: string;
        plane: RegisteredPluridPlane<PluridReactComponent>;
        treePlane: TreePlane;
        location: TreePlaneLocation;
        // #endregion values
    // #endregion required
}

export interface PluridPlaneStateProperties {
    stateTree: TreePlane[];
    // stateViewSize: ViewSize;
    stateViewSize: any;
    stateActivePlaneID: string;
    stateIsolatePlane: string;
    stateGeneralTheme: Theme;
    stateConfiguration: PluridConfiguration;
}

export interface PluridPlaneDispatchProperties {
    dispatchSetSpaceField: DispatchAction<typeof actions.space.setSpaceField>;
    dispatchUpdateSpaceTreePlane: DispatchAction<typeof actions.space.updateSpaceTreePlane>;
}

export type PluridPlaneProperties =
    & PluridPlaneOwnProperties
    & PluridPlaneStateProperties
    & PluridPlaneDispatchProperties;


const PluridPlane: React.FC<React.PropsWithChildren<PluridPlaneProperties>> = (
    properties,
) => {
    // #region context
    const context = useContext(Context);
    if (!context) {
        return (<></>);
    }

    const {
        planeRenderError,
        defaultPubSub,
    } = context;
    // #endregion context


    // #region properties
    const {
        // #region required
            // #region values
            planeID,
            plane,
            treePlane,

            children,
            // #endregion values
        // #endregion required

        // #region state
        stateTree,
        stateViewSize,
        stateActivePlaneID,
        stateIsolatePlane,
        stateGeneralTheme,
        stateConfiguration,
        // #endregion state

        // #region dispatch
        dispatchSetSpaceField,
        dispatchUpdateSpaceTreePlane,
        // #endregion dispatch
    } = properties;

    const {
        global,
        elements,
    } = stateConfiguration;

    const {
        transparentUI,
    } = global;

    const {
        controls,
        width: planeWidth,
        opacity: planeOpacity,
    } = elements.plane;

    const showPlaneControls = controls.show;

    const width = mathematics.numbers.checkIntegerNonUnit(planeWidth)
        ? planeWidth
        : planeWidth * stateViewSize.width;

    const parentTreePlane = space.tree.logic.getTreePlaneByID(
        stateTree,
        treePlane.parentPlaneID,
    );
    // #endregion properties


    // #region references
    const planeRef = useRef<HTMLDivElement>(null);
    // #endregion references


    // #region state
    const [
        remountKey,
        setRemountKey,
    ] = useState(0);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        mouseOver,
        setMouseOver,
    ] = useState(false);

    // based on camera location and world position compute transform matrix
    // #endregion state


    // #region handlers
    const updatePlaneSize = (
        size: any,
    ) => {
        const updatedTreePlane = {
            ...treePlane,
        };
        updatedTreePlane.width = size.width;
        updatedTreePlane.height = size.height;

        dispatchUpdateSpaceTreePlane(updatedTreePlane);
    }

    const refreshPlane = () => {
        const REFRESH_TIMEOUT = 250;
        setRefreshing(true);

        setTimeout(() => {
            setRemountKey(value => ++value);
            setRefreshing(false);
        }, REFRESH_TIMEOUT);
    }

    const isolatePlane = () => {
        const id = stateIsolatePlane !== planeID
            ? planeID
            : '';

        defaultPubSub.publish({
            topic: PLURID_PUBSUB_TOPIC.ISOLATE_PLANE,
            data: {
                id,
            },
        });
    }

    const closePlane = () => {
        defaultPubSub.publish({
            topic: PLURID_PUBSUB_TOPIC.CLOSE_PLANE,
            data: {
                id: planeID,
            },
        });
    }

    const setActivePlane = () => {
        const payload = {
            field: 'activePlaneID' as const,
            value: mouseOver ? planeID : '',
        };

        dispatchSetSpaceField(payload);
    }

    const debouncedSetActivePlane = useDebouncedCallback(
        () => {
            if (stateActivePlaneID === planeID) {
                return;
            }

            const payload = {
                field: 'activePlaneID' as const,
                value: planeID,
            };

            dispatchSetSpaceField(payload);
        },
        500,
    );

    const computeIsolatePlaneOpacity = () => {
        if (!treePlane.show || !stateIsolatePlane) {
            return;
        }

        if (stateIsolatePlane === planeID) {
            return '1';
        }

        return '0';
    }

    const computeIsolatePointerEvents = () => {
        if (!treePlane.show || !stateIsolatePlane) {
            return;
        }

        if (stateIsolatePlane === planeID) {
            return;
        }

        return 'none';
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        setActivePlane();
    }, [
        planeID,
        mouseOver,
    ]);

    /** PubSub refresh plane */
    useEffect(() => {
        const refreshPlaneIndex = defaultPubSub.subscribe({
            topic: PLURID_PUBSUB_TOPIC.REFRESH_PLANE,
            callback: (data) => {
                const {
                    id,
                } = data;

                if (id === planeID) {
                    refreshPlane();
                }
            },
        });

        return () => {
            defaultPubSub.unsubscribe(
                refreshPlaneIndex,
            );
        }
    }, [
        remountKey,
        planeID,
    ]);
    // #endregion effects


    // #region render
    // console.log('Render plane');
    const key = planeID + '-' + remountKey;
    const focusAnchorID = planeID + FOCUS_ANCHOR_SUFFIX;
    // const renderWidth = width;
    const renderWidth = '100%'; // TOFIX
    const isolatePlaneOpacity = computeIsolatePlaneOpacity();
    const isolatePointerEvents = computeIsolatePointerEvents();
    const transform = cleanTemplate(`
        translateX(${treePlane.location.translateX}px)
        translateY(${treePlane.location.translateY}px)
        translateZ(${treePlane.location.translateZ}px)
        rotateX(${treePlane.location.rotateX}deg)
        rotateY(${treePlane.location.rotateY}deg)
    `);

    const planeContentProperties = {
        // updatePlaneSize,
    };

    return (
        <StyledPluridPlane
            key={key}
            ref={planeRef}
            theme={stateGeneralTheme}
            planeControls={showPlaneControls}
            planeOpacity={planeOpacity}
            show={treePlane.show}
            id={planeID}
            style={{
                width: renderWidth,
                transform,
                opacity: isolatePlaneOpacity,
                pointerEvents: isolatePointerEvents,
            }}
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onMouseOver={() => debouncedSetActivePlane()}
            onMouseMove={() => debouncedSetActivePlane()}
            transparentUI={transparentUI}
            mouseOver={mouseOver}
            data-plurid-plane={planeID}
            data-plurid-entity={PLURID_ENTITY_PLANE}
        >
            <StyledFocusAnchor
                tabIndex={0}
                id={focusAnchorID}
            />

            {treePlane.show && (
                <>
                    {treePlane.parentPlaneID && (
                        <PlaneBridge
                            mouseOver={mouseOver}
                        />
                    )}

                    {showPlaneControls && (
                        <PlaneControls
                            plane={plane}
                            treePlane={treePlane}
                            parentTreePlane={parentTreePlane}
                            mouseOver={mouseOver}

                            refreshing={refreshing}
                            refreshPlane={refreshPlane}
                            isolatePlane={isolatePlane}
                            closePlane={closePlane}
                        />
                    )}

                    {planeRenderError ? (
                        <ErrorBoundary
                            renderError={typeof planeRenderError !== 'boolean'
                                ? planeRenderError : undefined
                            }
                        >
                            <PlaneContent
                                {...planeContentProperties}
                            >
                                {children}
                            </PlaneContent>
                        </ErrorBoundary>
                    ) : (
                        <PlaneContent
                            {...planeContentProperties}
                        >
                            {children}
                        </PlaneContent>
                    )}
                </>
            )}
        </StyledPluridPlane>
    );
    // #endregion render
}


const mapStateToProps = (
    state: AppState,
): PluridPlaneStateProperties => ({
    stateTree: selectors.space.getTree(state),
    stateViewSize: selectors.space.getViewSize(state),
    stateActivePlaneID: selectors.space.getActivePlaneID(state),
    stateIsolatePlane: selectors.space.getIsolatePlane(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateConfiguration: selectors.configuration.getConfiguration(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneDispatchProperties => ({
    dispatchSetSpaceField: (
        payload,
    ) => dispatch(
        actions.space.setSpaceField(payload),
    ),
    dispatchUpdateSpaceTreePlane: (
        payload,
    ) => dispatch(
        actions.space.updateSpaceTreePlane(payload),
    ),
});


const ConnectedPluridPlane = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridPlane);
// #endregion module



// #region exports
export default ConnectedPluridPlane;
// #endregion exports
