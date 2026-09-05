// #region imports
    // #region libraries
    import React, {
        useMemo,
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
    import {
        makeGetPlaneCulling,
        PlaneCullingState,
    } from '~services/state/modules/space/selectors';
    import actions from '~services/state/actions';

    import {
        reportPlaneSize,
    } from '~services/logic/camera';

    import {
        PluridPlaneDetailsContext,
    } from '~services/hooks/plane/context';
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
    import PlaneResizeHandles from './components/PlaneResizeHandles';
    import PlaneDebugger from './components/PlaneDebugger';
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
    // Only THIS plane's parent node (resolved by id off the memoized plane index), not the
    // whole tree — so an unrelated mutation (which structural sharing leaves this parent's
    // reference untouched) yields shallow-equal props and react-redux skips the re-render.
    stateParentPlane: TreePlane | undefined;
    // stateViewSize: ViewSize;
    stateViewSize: any;
    // A per-instance DERIVED boolean (`activePlaneID === this planeID`), not the raw shared
    // `activePlaneID` string: `activePlaneID` changes on every hover over ANY plane, so subscribing
    // to the string re-rendered all 40 planes on each hover. The boolean only flips for the two
    // planes whose active-state actually changes.
    stateIsActivePlane: boolean;
    stateIsolatePlane: string;
    /** ms of an animated relayout in flight (0 = none): the placement transition. */
    stateLayoutTransition: number;
    /** The culling pass's verdict for this plane. */
    stateCulled: PlaneCullingState;
    // A per-instance DERIVED boolean (this plane is in `selectedPlaneIDs`), same memoization
    // rationale as `stateIsActivePlane` — only flips for the plane whose selection actually changes.
    stateIsSelected: boolean;
    stateGeneralTheme: Theme;
    stateConfiguration: PluridConfiguration;
}

export interface PluridPlaneDispatchProperties {
    dispatchSetSpaceField: DispatchAction<typeof actions.space.setSpaceField>;
    dispatchSetPlaneSize: DispatchAction<typeof actions.space.setPlaneSize>;
    dispatchToggleSelection: DispatchAction<typeof actions.space.toggleSelection>;
}

export type PluridPlaneProperties =
    & PluridPlaneOwnProperties
    & PluridPlaneStateProperties
    & PluridPlaneDispatchProperties;


const PluridPlane: React.FC<React.PropsWithChildren<PluridPlaneProperties>> = (
    properties,
) => {
    // #region context
    // Read through optional chaining so every hook below runs on every render; the context
    // guard sits at the render step.
    const context = useContext(Context);
    const planeRenderError = context?.planeRenderError;
    const defaultPubSub = context?.defaultPubSub;
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
        stateParentPlane,
        stateViewSize,
        stateIsActivePlane,
        stateLayoutTransition,
        stateCulled,
        stateIsolatePlane,
        stateIsSelected,
        stateGeneralTheme,
        stateConfiguration,
        // #endregion state

        // #region dispatch
        dispatchSetSpaceField,
        dispatchSetPlaneSize,
        dispatchToggleSelection,
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

    // Resolved in `makeMapStateToProps` off the memoized plane index (no per-render tree walk).
    const parentTreePlane = stateParentPlane;
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

        defaultPubSub?.publish({
            topic: PLURID_PUBSUB_TOPIC.ISOLATE_PLANE,
            data: {
                id,
            },
        });
    }

    // What `usePluridPlane()` exposes about THIS plane (the `plurid` prop's `plane`, as a context):
    // a stable object per plane instance, so consumers re-render only when the plane's identity does.
    const planeDetails = useMemo(() => ({
        value: plane.route.absolute,
        planeID,
        parentPlaneID: treePlane.parentPlaneID,
        fragments: plane.route.fragments,
        parameters: plane.route.parameters,
        query: plane.route.query,
    }), [
        plane.route,
        planeID,
        treePlane.parentPlaneID,
    ]);

    const closePlane = () => {
        defaultPubSub?.publish({
            topic: PLURID_PUBSUB_TOPIC.CLOSE_PLANE,
            data: {
                id: planeID,
            },
        });
    }

    // Hover → the space's active plane. Enter activates immediately (no debounce: a stale
    // deferred closure used to re-activate a plane the pointer had already left); leave clears
    // only if THIS plane is still the active one, so entering the next plane never loses its
    // activation to the previous plane's leave.
    const activatePlane = () => {
        setMouseOver(true);
        if (!stateIsActivePlane) {
            dispatchSetSpaceField({
                field: 'activePlaneID' as const,
                value: planeID,
            });
        }
    }

    const deactivatePlane = () => {
        setMouseOver(false);
        if (stateIsActivePlane) {
            dispatchSetSpaceField({
                field: 'activePlaneID' as const,
                value: '',
            });
        }
    }

    const handlePlaneClick = (
        event: React.MouseEvent,
    ) => {
        // Shift+click toggles this plane's membership in the multi-selection. Plain clicks pass
        // through untouched so the host's plane content stays fully interactive; `preventDefault`
        // suppresses the stray text-selection a shift+click would otherwise start.
        if (event.shiftKey) {
            event.preventDefault();
            dispatchToggleSelection(planeID);
            return;
        }
        // ⌘/Ctrl+click toggles too (the selection modifier; ⌘/Ctrl-drag on empty space is the
        // marquee). The default is kept so a host's ⌘-click behaviors (open in a new tab) run.
        if (event.ctrlKey || event.metaKey) {
            dispatchToggleSelection(planeID);
        }
    }

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
    /**
     * Measure the rendered plane and write its size into the tree (`treePlane.width/height`) —
     * the source every geometry consumer reads (fit-to-view, framing, link beams, minimap, bounds).
     * `offsetWidth/Height` are the untransformed layout box, so the CSS 3D transform never leaks
     * into the measurement. The reducer is equality-gated, so a re-report costs nothing. A plane the
     * user resized by hand (`sizeMode: 'manual'`) is left alone.
     */
    useEffect(() => {
        const element = planeRef.current;
        if (
            !element
            || typeof ResizeObserver === 'undefined'
            || treePlane.sizeMode === 'manual'
            || stateCulled !== 'visible'
        ) {
            return;
        }

        const report = () => {
            const width = Math.round(element.offsetWidth * 2) / 2;
            const height = Math.round(element.offsetHeight * 2) / 2;
            if (width <= 0 || height <= 0) {
                return;
            }
            dispatchSetPlaneSize({
                planeID,
                width,
                height,
            });
        };

        report();
        const observer = new ResizeObserver(() => {
            report();
        });
        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [
        planeID,
        remountKey,
        treePlane.sizeMode,
        stateCulled,
    ]);

    /** PubSub refresh plane */
    useEffect(() => {
        if (!defaultPubSub) {
            return;
        }

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
    if (!context) {
        return (<></>);
    }

    // console.log('Render plane');
    const key = planeID + '-' + remountKey;
    const focusAnchorID = planeID + FOCUS_ANCHOR_SUFFIX;
    // Render the plane at its computed width (matches the layout's translateX spacing,
    // which is derived from the same `width`). A hardcoded 100% made every plane span the
    // full viewport, so fractional widths and multi-column layouts overlapped.
    // A hand-resized plane renders the size the tree holds; otherwise the configured width and
    // the content's own height.
    // A hand-resized plane renders the size the tree holds; a plane that DECLARED a size at
    // registration renders exactly that (its content scrolls inside a declared height; a
    // declared width alone keeps the content-driven height); otherwise the configured width and
    // the content's own height.
    const manualSize = treePlane.sizeMode === 'manual' && treePlane.width > 0;
    const declaredWidth = plane.width && plane.width > 0 ? plane.width : 0;
    const declaredHeight = plane.height && plane.height > 0 ? plane.height : 0;
    const renderWidth = (manualSize ? treePlane.width : (declaredWidth || width)) + 'px';
    const renderHeight = manualSize && treePlane.height > 0
        ? treePlane.height + 'px'
        : (declaredHeight ? declaredHeight + 'px' : undefined);
    const fixedHeight = !!renderHeight;
    const resizable = !!stateConfiguration.elements.plane.resizable && stateIsSelected && treePlane.show;
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
        fixedHeight,
    };

    return (
        <StyledPluridPlane
            key={key}
            ref={planeRef}
            theme={stateGeneralTheme}
            planeControls={showPlaneControls}
            planeOpacity={planeOpacity}
            fixedHeight={fixedHeight}
            show={treePlane.show}
            id={planeID}
            style={{
                width: renderWidth,
                height: renderHeight,
                transform,
                // Animated relayout (FLIP): planes glide to their new placements only while the
                // View holds the transition window open — never during a spawn or a drag.
                transition: stateLayoutTransition > 0
                    ? `transform ${stateLayoutTransition}ms cubic-bezier(0.22, 1, 0.36, 1)`
                    : undefined,
                opacity: isolatePlaneOpacity,
                pointerEvents: isolatePointerEvents,
            }}
            onPointerEnter={activatePlane}
            onPointerLeave={deactivatePlane}
            onFocusCapture={activatePlane}
            onClick={handlePlaneClick}
            selected={stateIsSelected}
            transparentUI={transparentUI}
            mouseOver={mouseOver}
            data-plurid-plane={planeID}
            data-plurid-entity={PLURID_ENTITY_PLANE}
            data-plurid-culled={stateCulled !== 'visible' ? stateCulled : undefined}
            backface={stateConfiguration.elements.plane.backface}
            depthFade={!!stateConfiguration.elements.plane.depthFade?.enabled}
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
                            bridgeLength={treePlane.bridgeLength}
                            bridgeSide={treePlane.bridgeSide}
                        />
                    )}

                    {resizable && (
                        <PlaneResizeHandles
                            planeID={planeID}
                            width={treePlane.width || width}
                            height={treePlane.height || (planeRef.current?.offsetHeight ?? 0)}
                        />
                    )}

                    {stateConfiguration.development?.planeDebugger && (
                        <PlaneDebugger
                            treePlane={treePlane}
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
                                <PluridPlaneDetailsContext.Provider
                                    value={planeDetails}
                                >
                                    {children}
                                </PluridPlaneDetailsContext.Provider>
                            </PlaneContent>
                        </ErrorBoundary>
                    ) : (
                        <PlaneContent
                            {...planeContentProperties}
                        >
                            <PluridPlaneDetailsContext.Provider
                                value={planeDetails}
                            >
                                {children}
                            </PluridPlaneDetailsContext.Provider>
                        </PlaneContent>
                    )}
                </>
            )}
        </StyledPluridPlane>
    );
    // #endregion render
}


// Factory form (`connect` detects it because it returns a function): each plane instance gets
// its OWN memoized parent-by-id selector, so the lookup is an O(1) `Map.get` off the shared
// memoized index — never a per-dispatch tree walk. During an orbit gesture the tree is
// untouched, so this returns shallow-equal props and the plane skips re-render entirely.
const makeMapStateToProps = () => {
    const getParentPlane = selectors.space.makeGetTreePlaneByID();
    const getIsSelected = selectors.space.makeGetIsPlaneSelected();
    const getPlaneCulling = makeGetPlaneCulling();

    return (
        state: AppState,
        ownProps: PluridPlaneOwnProperties,
    ): PluridPlaneStateProperties => ({
        stateParentPlane: getParentPlane(state, ownProps.treePlane?.parentPlaneID),
        stateViewSize: selectors.space.getViewSize(state),
        stateIsActivePlane: selectors.space.getActivePlaneID(state) === ownProps.planeID,
        stateLayoutTransition: state.space.layoutTransition || 0,
        stateCulled: getPlaneCulling(state, ownProps.planeID),
        stateIsolatePlane: selectors.space.getIsolatePlane(state),
        stateIsSelected: getIsSelected(state, ownProps.planeID),
        stateGeneralTheme: selectors.themes.getGeneralTheme(state),
        stateConfiguration: selectors.configuration.getConfiguration(state),
    });
};


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneDispatchProperties => ({
    dispatchSetSpaceField: (
        payload,
    ) => dispatch(
        actions.space.setSpaceField(payload),
    ),
    dispatchSetPlaneSize: (
        payload,
    ) => dispatch(
        reportPlaneSize(payload) as any,
    ),
    dispatchToggleSelection: (
        payload,
    ) => dispatch(
        actions.space.toggleSelection(payload),
    ),
});


// `React.memo` so a plane whose own props (its structurally-shared `treePlane` + memoized state
// props) are unchanged bails out even when an ancestor re-renders — see the matching note in Root.
const ConnectedPluridPlane = connect(
    makeMapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(React.memo(PluridPlane));
// #endregion module



// #region exports
export default ConnectedPluridPlane;
// #endregion exports
