// #region imports
    // #region libraries
    import React, {
        useContext,
        useState,
        useRef,
        useMemo,
        useCallback,
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

    import {
        // #region constants
        PLURID_DEFAULT_CONFIGURATION_LINK_SUFFIX,
        PLURID_ENTITY_LINK,
        PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_IN,
        PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_OUT,
        // #endregion constants

        // #region interfaces
        PluridLink as PluridLinkOwnProperties,
        TreePlane,
        PluridConfiguration,
        LinkCoordinates,
        // #endregion interfaces
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import {
        defaultLinkCoordinates,
    } from '~data/constants';

    import PluridPortal from '~components/utilities/Portal';

    import Context from '~services/context';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    import actions from '~services/state/actions';
    import {
        ViewSize,
    } from '~services/state/modules/space/types';

    import {
        toggleLinkPlane,
    } from '~services/state/thunks/planes';

    import {
        navigateToPluridPlane,
    } from '~services/logic/animation';

    import {
        measureLinkCoordinates,
        resolveLinkID,
    } from '~services/logic/link/measure';
    import {
        bridgeGeometry,
        BRIDGE_REACH_VARIABLE,
        BRIDGE_ANGLE_VARIABLE,
    } from '~services/logic/link/bridge';

    import {
        planeElementOf,
    } from '~services/logic/input/guard';

    import {
        getPlanesRegistrar,

        resolveRoute,
        computePlaneAddress,

        space,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import PluridPlanePreview from './components/Preview';

    import {
        StyledPluridLink,
    } from './styled';

    import useLinkPreview from './hooks/useLinkPreview';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridLinkStateProperties {
    stateTree: TreePlane[];
    stateGeneralTheme: Theme;
    stateConfiguration: PluridConfiguration;
    stateViewSize: ViewSize;
}

export interface PluridLinkDispatchProperties {
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
}

export type PluridLinkProperties =
    & PluridLinkOwnProperties<PluridReactComponent, React.CSSProperties, React.MouseEvent>
    & PluridLinkStateProperties
    & PluridLinkDispatchProperties;


/**
 * The in-space anchor: clicking spawns (or toggles) the target plane next to this one, joined by a
 * bridge. The TREE is the single source of truth for the link's state — the spawned plane is found
 * by the link's stable id (`spawnedByLinkID`), so undo, host `setTree`, collaboration and relayouts
 * all keep the link in step; nothing is held in local state that could go stale. The link measures
 * where it sits on its plane (layout offsets, not transformed rects) and re-measures only when the
 * plane, the view, or the link itself changes size.
 */
const PluridLink: React.FC<React.PropsWithChildren<PluridLinkProperties>> = (
    properties,
) => {
    // #region context
    const context = useContext(Context);
    const hostname = context?.hostname;
    const planesRegistrar = context?.planesRegistrar;
    const planesRegistry = getPlanesRegistrar(planesRegistrar);
    // #endregion context


    // #region properties
    const {
        // #region own
        children,
        route: planeRoute,
        devisible: devisibleProperty,
        suffix: suffixProperty,
        atClick,
        style,
        className,
        preview,
        previewComponent,
        previewFadeIn,
        previewFadeOut,
        previewOffsetX,
        previewOffsetY,
        linkID: linkIDProperty,
        // #endregion own

        // #region state
        stateTree,
        stateGeneralTheme,
        stateConfiguration,
        stateViewSize,
        // #endregion state

        // #region dispatch
        dispatch,
        // #endregion dispatch
    } = properties;

    const previewAppearTime = previewFadeIn || PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_IN;
    const previewDisappearTime = previewFadeOut || PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_OUT;

    const planeRouteResolved = computePlaneAddress(planeRoute);

    const absolutePlaneRoute = resolveRoute(
        planeRouteResolved,
        stateConfiguration.network.protocol,
        hostname || stateConfiguration.network.host,
    );
    const route = absolutePlaneRoute?.route || planeRouteResolved;

    const suffix = suffixProperty ?? PLURID_DEFAULT_CONFIGURATION_LINK_SUFFIX;
    const devisible = devisibleProperty ?? false;
    // #endregion properties


    // #region references
    const linkElement: React.RefObject<HTMLAnchorElement> = useRef(null);
    /** The coordinates the tree holds for the spawned plane (mirrors `childPlane.linkCoordinates`). */
    const storedCoordinates = useRef<LinkCoordinates | undefined>(undefined);
    // #endregion references


    // #region state
    const [mouseOver, setMouseOver] = useState(false);
    const [parentPlaneID, setParentPlaneID] = useState('');
    const [linkID, setLinkID] = useState('');
    const [linkCoordinates, setLinkCoordinates] = useState<LinkCoordinates>(defaultLinkCoordinates);

    // Derived from the tree — never held locally.
    const childPlane = useMemo(
        () => (parentPlaneID && linkID
            ? space.tree.fields.findPlaneByLinkID(stateTree, parentPlaneID, linkID)
            : undefined),
        [
            stateTree,
            parentPlaneID,
            linkID,
        ],
    );
    const parentPlane = useMemo(
        () => (parentPlaneID ? space.tree.logic.getTreePlaneByID(stateTree, parentPlaneID) : undefined),
        [
            stateTree,
            parentPlaneID,
        ],
    );
    const showLink = !!childPlane && childPlane.show !== false;
    const pluridPlaneID = childPlane?.planeID || '';
    storedCoordinates.current = childPlane?.linkCoordinates;
    // the spawn geometry the leash is drawn with (stored on the tree node at spawn)
    const bridgeRef = useRef<{ length: number; side: 'start' | 'end' }>({ length: 100, side: 'start' });
    bridgeRef.current = {
        length: childPlane?.bridgeLength ?? 100,
        side: childPlane?.bridgeSide ?? 'start',
    };
    // #endregion state


    // Hover-preview state machine (timers + showPreview) lives in `useLinkPreview`.
    const {
        showPreview,
        setShowPreview,
    } = useLinkPreview({
        preview,
        mouseOver,
        appearTime: previewAppearTime,
        disappearTime: previewDisappearTime,
    });


    // #region handlers
    const measure = useCallback((): LinkCoordinates | undefined => {
        const element = linkElement.current;
        const planeElement = element ? planeElementOf(element) : null;
        if (!element || !planeElement) {
            return undefined;
        }
        return measureLinkCoordinates(element, planeElement);
    }, []);

    const defocusLink = () => {
        if (linkElement.current) {
            linkElement.current.blur();
        }
    }

    const handleClick = useCallback((
        event: React.MouseEvent<HTMLAnchorElement>,
    ) => {
        event.preventDefault();

        if (atClick !== undefined) {
            atClick(event);
        }

        // Ctrl/Cmd-click is the host's (a new tab, a multi-select); Alt-click re-navigates to the
        // plane this link already opened.
        if (event.ctrlKey || event.metaKey) {
            return;
        }
        if (event.altKey) {
            if (childPlane && childPlane.show !== false) {
                navigateToPluridPlane(dispatch, childPlane, event);
            }
            return;
        }

        if (!parentPlaneID || !linkID || !planesRegistry) {
            return;
        }

        const coordinates = measure() || linkCoordinates;
        setLinkCoordinates(coordinates);
        setShowPreview(false);

        dispatch(toggleLinkPlane({
            parentPlaneID,
            linkID,
            route,
            linkCoordinates: coordinates,
            planesRegistry: planesRegistry.getAll(),
            hostname,
        }) as any);

        defocusLink();
    }, [
        atClick,
        childPlane,
        parentPlaneID,
        linkID,
        route,
        planesRegistry,
        hostname,
        linkCoordinates,
        measure,
    ]);

    const handleKeyUp = (
        event: React.KeyboardEvent,
    ) => {
        if (event.code === 'Enter') {
            // The link is an anchor without an `href`, so Enter has no native click: run ours.
            handleClick(event as any);
        }
    }
    // #endregion handlers


    // #region effects
    /** Identity + first measurement: which plane hosts this link, and where it sits on it. */
    useEffect(() => {
        const element = linkElement.current;
        const planeElement = element ? planeElementOf(element) : null;
        if (!element || !planeElement) {
            return;
        }

        setParentPlaneID(planeElement.getAttribute('data-plurid-plane') || '');
        setLinkID(resolveLinkID(element, planeElement, route, linkIDProperty));
        setLinkCoordinates(measureLinkCoordinates(element, planeElement));
    }, [
        route,
        linkIDProperty,
    ]);

    /**
     * Keep the spawned plane attached to the link as the link moves within its plane: re-measure
     * when the plane's measured size, the view, or the link element itself changes — through the
     * equality-gated reducer, so an unchanged measurement dispatches nothing.
     */
    useEffect(() => {
        if (!showLink || !pluridPlaneID) {
            return;
        }
        const element = linkElement.current;
        const planeElement = element ? planeElementOf(element) : null;
        if (!element || !planeElement) {
            return;
        }

        const update = () => {
            const coordinates = measureLinkCoordinates(element, planeElement);
            setLinkCoordinates((previous) => (
                previous.x === coordinates.x && previous.y === coordinates.y
                    ? previous
                    : coordinates
            ));
            // Dispatch only when the tree holds something else: the reducer is equality-gated
            // too, but a no-op dispatch still notifies every store subscriber.
            const stored = storedCoordinates.current;
            if (stored && stored.x === coordinates.x && stored.y === coordinates.y) {
                return;
            }
            storedCoordinates.current = coordinates;
            dispatch(actions.space.updateLinkCoordinates({
                planeID: pluridPlaneID,
                linkCoordinates: coordinates,
            }));
        };

        // THE LEASH (`services/logic/link/bridge.ts`): while the link scrolls inside its plane the
        // child stays where it is and the bridge follows the link — two custom properties on the
        // child plane element, written per frame, never through the store. `scroll` does not
        // bubble; a capture listener on the plane catches every scroller inside it.
        let childElement: HTMLElement | null = null;
        const findChild = () => {
            if (!childElement || !childElement.isConnected) {
                childElement = document.querySelector<HTMLElement>(
                    '[data-plurid-plane="' + pluridPlaneID.replace(/["\\]/g, '\\$&') + '"]',
                );
            }
            return childElement;
        };
        let frame = 0;
        const follow = () => {
            frame = 0;
            const target = findChild();
            if (!target) {
                return;
            }
            const current = measureLinkCoordinates(element, planeElement);
            const geometry = bridgeGeometry(storedCoordinates.current, current, bridgeRef.current.length, bridgeRef.current.side);
            target.style.setProperty(BRIDGE_REACH_VARIABLE, geometry.reach + 'px');
            target.style.setProperty(BRIDGE_ANGLE_VARIABLE, geometry.angle + 'deg');
        };
        const onScroll = () => {
            if (!frame && typeof requestAnimationFrame === 'function') {
                frame = requestAnimationFrame(follow);
            }
        };
        const measureAndFollow = () => {
            update();
            follow();
        };

        measureAndFollow();
        planeElement.addEventListener('scroll', onScroll, true);

        let observer: ResizeObserver | undefined;
        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(() => {
                measureAndFollow();
            });
            observer.observe(element);
        }

        return () => {
            planeElement.removeEventListener('scroll', onScroll, true);
            if (frame && typeof cancelAnimationFrame === 'function') {
                cancelAnimationFrame(frame);
            }
            if (observer) {
                observer.disconnect();
            }
            const target = childElement && childElement.isConnected ? childElement : null;
            if (target) {
                target.style.removeProperty(BRIDGE_REACH_VARIABLE);
                target.style.removeProperty(BRIDGE_ANGLE_VARIABLE);
            }
        };
    }, [
        showLink,
        pluridPlaneID,
        parentPlane?.width,
        parentPlane?.height,
        stateViewSize.width,
        stateViewSize.height,
    ]);
    // #endregion effects


    // #region render
    if (!context || !planesRegistry) {
        return (<>{children}</>);
    }

    return (
        <StyledPluridLink
            ref={linkElement}
            onClick={(event: React.MouseEvent<HTMLAnchorElement>) => handleClick(event)}
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onKeyUp={(event) => handleKeyUp(event)}
            theme={stateGeneralTheme}
            suffix={suffix}
            devisible={devisible}
            style={{
                ...style,
            }}
            className={className}
            data-plurid-entity={PLURID_ENTITY_LINK}
            data-plurid-link={linkID || undefined}
            data-plurid-link-route={route}
            data-plurid-link-open={showLink ? 'true' : undefined}
            tabIndex={0}
        >
            {children}

            {showPreview
            && !showLink
            && (
                <PluridPortal
                    elementID={`preview-${parentPlaneID}`}
                    rootID={parentPlaneID}
                >
                    <PluridPlanePreview
                        planeRoute={planeRouteResolved}
                        linkCoordinates={linkCoordinates}
                        previewComponent={previewComponent}
                        previewOffsetX={previewOffsetX}
                        previewOffsetY={previewOffsetY}
                    />
                </PluridPortal>
            )}
        </StyledPluridLink>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridLinkStateProperties => ({
    stateTree: selectors.space.getTree(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateViewSize: selectors.space.getViewSize(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridLinkDispatchProperties => ({
    dispatch,
});


const ConnectedPluridLink = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridLink);


type PluridLinkPublicProperties = React.PropsWithChildren<
    PluridLinkOwnProperties<PluridReactComponent, React.CSSProperties, React.MouseEvent>
>;


/**
 * Outside an application (a host's unit test, a static render of plane content) there is no
 * engine store for the connected link: render a plain anchor to the route instead of crashing.
 * The host's `atClick` still runs; the browser keeps the click (no `preventDefault`).
 */
const PluridLinkFallback: React.FC<PluridLinkPublicProperties> = ({
    children,
    route,
    atClick,
    style,
    className,
}) => (
    <a
        href={computePlaneAddress(route)}
        style={style}
        className={className}
        onClick={atClick ? (event) => atClick(event) : undefined}
        data-plurid-entity={PLURID_ENTITY_LINK}
        data-plurid-link-route={route}
    >
        {children}
    </a>
);


/** The link renders through the engine inside an application and as a plain anchor outside one. */
const PluridLinkGate: React.FC<PluridLinkPublicProperties> = (
    properties,
) => {
    const engine = useContext(Context);
    const store = useContext(StateContext);

    if (!engine || !store) {
        return (
            <PluridLinkFallback
                {...properties}
            />
        );
    }

    return (
        <ConnectedPluridLink
            {...(properties as any)}
        />
    );
};
// #endregion module



// #region exports
export default PluridLinkGate;
// #endregion exports
