// #region imports
    // #region libraries
    import React, {
        useContext,
        useState,
        useEffect,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PLURID_PUBSUB_TOPIC,
        RegisteredPluridPlane,
        TreePlane,
        TreePlaneLocation,
        PluridConfiguration,
        PLURID_ENTITY_PLANE,
    } from '@plurid/plurid-data';

    import {
        cleanTemplate,
        space,
    } from '@plurid/plurid-engine';

    import {
        mathematics,
    } from '@plurid/plurid-functions';

    import {
        useDebouncedCallback,
    } from '@plurid/plurid-functions-react';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import ErrorBoundary from '~components/utilities/ErrorBoundary';

    import Context from '~services/context';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import { ViewSize } from '~services/state/types/space';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridPlane,
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
    stateViewSize: ViewSize;
    stateActivePlaneID: string;
    stateIsolatePlane: string;
    stateGeneralTheme: Theme;
    stateConfiguration: PluridConfiguration;
}

export interface PluridPlaneDispatchProperties {
    dispatchSetSpaceField: typeof actions.space.setSpaceField;
    dispatchUpdateSpaceTreePlane: typeof actions.space.updateSpaceTreePlane;
}

export type PluridPlaneProperties =
    & PluridPlaneOwnProperties
    & PluridPlaneStateProperties
    & PluridPlaneDispatchProperties;


const PluridPlane: React.FC<React.PropsWithChildren<PluridPlaneProperties>> = (
    properties,
) => {
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


    // #region state
    const [
        remountKey,
        setRemountKey,
    ] = useState(0);

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
        setRemountKey(value => ++value);
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
    /** Refresh plane */
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

    useEffect(() => {
        setActivePlane();
    }, [
        planeID,
        mouseOver,
    ]);
    // #endregion effects


    // #region render
    // console.log('Render plane');
    const key = planeID + '-' + remountKey;
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
            {treePlane.show && (
                <>
                    {treePlane.parentPlaneID && (
                        <PlaneBridge
                            treePlane={treePlane}
                            parentTreePlane={parentTreePlane!}
                        />
                    )}

                    {showPlaneControls && (
                        <PlaneControls
                            plane={plane}
                            treePlane={treePlane}
                            parentTreePlane={parentTreePlane}
                            mouseOver={mouseOver}

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
        treePlane: TreePlane,
    ) => dispatch(
        actions.space.updateSpaceTreePlane(treePlane),
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
