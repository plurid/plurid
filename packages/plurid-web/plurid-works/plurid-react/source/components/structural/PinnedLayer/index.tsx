// #region imports
    // #region libraries
    import React, {
        useCallback,
        useContext,
        useLayoutEffect,
        useMemo,
        useRef,
    } from 'react';

    import {
        createDispatchHook,
        createSelectorHook,
    } from 'react-redux';

    import {
        PLURID_ENTITY_PINNED_LAYER,
        PLURID_ENTITY_PINNED_PLANE,
        PLURID_ATTRIBUTE_PINNED,
        PLURID_ATTRIBUTE_COLLAPSED,
    } from '@plurid/plurid-data';
    import type {
        PluridPinnedPlane,
        PluridPinnedChromeContext,
        PluridPlaceOptions,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import Context from '~services/context';
    import StateContext from '~services/state/context';
    import type {
        AppState,
    } from '~services/state/store';
    import type {
        PluridThunkExtra,
    } from '~services/state/extra';
    import {
        planeAddressPath,
        space as spaceEngine,
    } from '~services/engine';
    import {
        pinnedPlanesFrom,
        placePinnedPlane,
        collapsePinnedPlane,
        raisePinnedPlane,
    } from '~services/logic/pinned';
    // #endregion external


    // #region internal
    import {
        StyledPinnedLayer,
        StyledPinnedFrame,
        StyledPinnedBar,
        StyledPinnedTitle,
        StyledPinnedButton,
        StyledPinnedContent,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const useEngineSelector = createSelectorHook(StateContext as any);
const useEngineDispatch = createDispatchHook(StateContext as any);

export interface PluridPinnedLayerProperties {
    thunkExtra?: PluridThunkExtra;
    renderPinnedControls?: (context: PluridPinnedChromeContext) => React.ReactNode;
}

/** The plane's declared document title, else its path. */
const titleOf = (
    route: string,
    head: unknown,
): string => {
    const declared = head && typeof head === 'object' && typeof (head as { title?: unknown }).title === 'string'
        ? (head as { title: string }).title
        : '';
    return declared || planeAddressPath(route) || route;
};

/** The bar's glyphs, drawn, so no font is needed for them. */
const icon = (
    path: string,
) => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d={path} />
    </svg>
);
const ICON_COLLAPSE = icon('M3 7h8');
const ICON_EXPAND = icon('M3 3h8v8H3z');
/** into the space: an arrow down onto a ground line */
const ICON_PLACE = icon('M7 2v7M4 6l3 3 3-3M2.5 12h9');

interface PinnedFrameProperties {
    pinned: PluridPinnedPlane;
    title: string;
    front: boolean;
    /** Where the plane was drawn when it was pinned, taken once, at the frame's mount. */
    flights?: Map<string, { left: number; top: number; width: number; height: number }>;
    flightDuration: number;
    chrome: Omit<PluridPinnedChromeContext, 'planeID' | 'route' | 'title' | 'collapsed' | 'frame' | 'place' | 'collapse' | 'raise'> | undefined;
    renderPinnedControls?: (context: PluridPinnedChromeContext) => React.ReactNode;
    dispatch: (action: any) => any;
    contentHosts: { pinned: (planeID: string, slot: HTMLElement | null) => void } | undefined;
}

const PinnedFrame: React.FC<PinnedFrameProperties> = ({
    pinned,
    title,
    front,
    flights,
    flightDuration,
    chrome,
    renderPinnedControls,
    dispatch,
    contentHosts,
}) => {
    const { planeID, frame, collapsed } = pinned;
    const element = useRef<HTMLDivElement>(null);
    // the content's height while collapsed: the frame clips to its bar, the content keeps its size
    // (and its scroll) underneath
    const expanded = useRef(frame.height);
    if (!collapsed) {
        expanded.current = frame.height;
    }

    // THE CONTENT COMES HERE: the plane's content host joins the frame's slot, and goes back to the
    // world shell when the frame goes (a place)
    const slot = useCallback((element: HTMLDivElement | null) => {
        contentHosts?.pinned(planeID, element);
    }, [
        contentHosts,
        planeID,
    ]);

    // the pin's flight: from where the plane was drawn in the space to the frame, once
    useLayoutEffect(() => {
        const node = element.current;
        const flight = flights?.get(planeID);
        flights?.delete(planeID);
        if (!flight || !node || flightDuration <= 0 || typeof node.animate !== 'function' || !(frame.width > 0) || !(frame.height > 0)) {
            return;
        }
        node.animate([
            {
                transform: `translate(${flight.left - frame.left}px, ${flight.top - frame.top}px) scale(${flight.width / frame.width}, ${flight.height / frame.height})`,
            },
            { transform: 'none' },
        ], {
            duration: flightDuration,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        });
    }, []);

    const commands = useMemo(() => ({
        place: (options?: PluridPlaceOptions) => dispatch(placePinnedPlane(planeID, options)) as Promise<any>,
        collapse: (next?: boolean) => {
            dispatch(collapsePinnedPlane(planeID, next));
        },
        raise: () => {
            dispatch(raisePinnedPlane(planeID));
        },
    }), [
        dispatch,
        planeID,
    ]);

    const raise = () => {
        if (!front) {
            commands.raise();
        }
    };

    const context: PluridPinnedChromeContext | undefined = chrome && renderPinnedControls
        ? {
            ...chrome,
            planeID,
            route: pinned.route,
            title,
            collapsed,
            frame,
            ...commands,
        }
        : undefined;

    return (
        <StyledPinnedFrame
            ref={element}
            data-plurid-entity={PLURID_ENTITY_PINNED_PLANE}
            {...{
                [PLURID_ATTRIBUTE_PINNED]: planeID,
                [PLURID_ATTRIBUTE_COLLAPSED]: collapsed ? 'true' : undefined,
            }}
            role="dialog"
            aria-label={title}
            style={{
                left: frame.left,
                top: frame.top,
                width: frame.width,
                height: frame.height,
                zIndex: pinned.order,
            }}
            onPointerDownCapture={raise}
            onFocusCapture={raise}
        >
            <StyledPinnedBar>
                {context && renderPinnedControls ? renderPinnedControls(context) : (
                    <>
                        <StyledPinnedTitle>{title}</StyledPinnedTitle>
                        <StyledPinnedButton
                            type="button"
                            data-plurid-control="pinned-collapse"
                            aria-label={collapsed ? 'expand ' + title : 'collapse ' + title}
                            aria-expanded={!collapsed}
                            title={collapsed ? 'Expand' : 'Collapse'}
                            onClick={() => commands.collapse()}
                        >
                            {collapsed ? ICON_EXPAND : ICON_COLLAPSE}
                        </StyledPinnedButton>
                        <StyledPinnedButton
                            type="button"
                            data-plurid-control="pinned-place"
                            aria-label={'place ' + title + ' in the space'}
                            title="Place in space"
                            onClick={() => {
                                void commands.place();
                            }}
                        >
                            {ICON_PLACE}
                        </StyledPinnedButton>
                    </>
                )}
            </StyledPinnedBar>
            {/* the plane's content stands here: from inside it the plane is this element (a link
                finds the plane it opens from), while a lookup by id finds the world shell first */}
            <StyledPinnedContent
                data-plurid-plane={planeID}
                data-plurid-pinned-content={planeID}
                aria-hidden={collapsed || undefined}
                style={collapsed ? { height: Math.max(0, expanded.current - frame.height) } : undefined}
            >
                <div
                    ref={slot}
                    data-plurid-pinned-slot={planeID}
                    style={{ display: 'contents' }}
                />
            </StyledPinnedContent>
        </StyledPinnedFrame>
    );
};


/**
 * THE PINNED LAYER (2026-10-31): the screen-space layer over the view that holds the pinned planes,
 * each at its rect, in its stacking order, the camera's moves under them. An engine overlay
 * (`data-plurid-overlay`): a press, a wheel or a key on a pinned plane is the plane's, and nothing in
 * the space moves for it; where no frame is, input goes through to the space.
 */
const PluridPinnedLayer: React.FC<PluridPinnedLayerProperties> = ({
    thunkExtra,
    renderPinnedControls,
}) => {
    const context = useContext(Context);
    const dispatch = useEngineDispatch();
    // the pinned planes, as a string the selector compares: the layer renders when one of them
    // changes, not on every tree write (a drag writes the tree per frame) or camera frame
    const pinnedKey = useEngineSelector((state: AppState) => {
        const planes = pinnedPlanesFrom(state.space.tree, state.space.viewSize);
        return planes.length === 0
            ? ''
            : JSON.stringify(planes.map((plane) => ({
                ...plane,
                sourceID: spaceEngine.tree.logic.getTreePlaneByID(state.space.tree, plane.planeID)?.sourceID ?? '',
            })));
    });
    const configuration = useEngineSelector((state: AppState) => state.configuration);
    const pinned = useMemo(
        () => (pinnedKey ? JSON.parse(pinnedKey) as (PluridPinnedPlane & { sourceID: string })[] : []),
        [pinnedKey],
    );

    if (pinned.length === 0) {
        return null;
    }

    const registrar = context?.planesRegistrar;
    const registered = registrar ? registrar.getAll() : undefined;
    const front = pinned[pinned.length - 1]?.planeID;
    const reduced = !!thunkExtra?.motion?.reducedMotion();
    const flightDuration = reduced ? 0 : Math.min(320, configuration.space.navigation?.motion?.duration ?? 380);
    const chrome = context?.chrome
        ? {
            look: context.chrome.look,
            tokens: context.chrome.look.tokens,
            docked: context.chrome.docked,
            presentation: context.chrome.presentation,
            configuration,
            pubsub: context.chrome.pubsub,
        }
        : undefined;

    return (
        <StyledPinnedLayer
            data-plurid-entity={PLURID_ENTITY_PINNED_LAYER}
            data-plurid-overlay="pinned"
        >
            {pinned.map((plane) => {
                return (
                    <PinnedFrame
                        key={plane.planeID}
                        pinned={plane}
                        title={titleOf(plane.route, (registered?.get(plane.sourceID) as { head?: unknown } | undefined)?.head)}
                        front={plane.planeID === front}
                        flights={thunkExtra?.pinFlights}
                        flightDuration={flightDuration}
                        chrome={chrome as any}
                        renderPinnedControls={renderPinnedControls}
                        dispatch={dispatch}
                        contentHosts={context?.contentHosts}
                    />
                );
            })}
        </StyledPinnedLayer>
    );
};
// #endregion module



// #region exports
export default PluridPinnedLayer;
// #endregion exports
