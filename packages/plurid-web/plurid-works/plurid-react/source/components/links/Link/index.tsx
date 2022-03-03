// #region imports
    // #region libraries
    import React, {
        useContext,
        useState,
        useRef,
        useCallback,
        useEffect,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

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
        // #endregion interfaces
    } from '@plurid/plurid-data';

    import {
        planes,
        routing,
        space,
        general as generalEngine,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
        PluridLinkCoordinates,
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
        UpdateSpaceLinkCoordinatesPayload,
    } from '~services/state/modules/space/types';
    // #endregion external


    // #region internal
    import PluridPlanePreview from './components/Preview';

    import {
        StyledPluridLink,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    resolveRoute,
    computePlaneAddress,
} = routing;

const {
    getPlanesRegistrar,
    getPluridPlaneIDByData,
} = planes;



export interface PluridLinkStateProperties {
    stateTree: TreePlane[];
    stateGeneralTheme: Theme;
    stateConfiguration: PluridConfiguration;
    stateViewSize: ViewSize;
}

export interface PluridLinkDispatchProperties {
    dispatchSetTree: typeof actions.space.setTree;
    dispatchUpdateSpaceLinkCoordinates: typeof actions.space.updateSpaceLinkCoordinates;
}

export type PluridLinkProperties =
    & PluridLinkOwnProperties<PluridReactComponent>
    & PluridLinkStateProperties
    & PluridLinkDispatchProperties;


const PluridLink: React.FC<React.PropsWithChildren<PluridLinkProperties>> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        children,
        route: planeRoute,
        devisible: _devisible,
        suffix: _suffix,
        atClick,
        style,
        className,
        // #endregion own

        // #region state
        stateTree,
        stateGeneralTheme,
        stateConfiguration,
        stateViewSize,
        // #endregion state

        // #region dispatch
        dispatchSetTree,
        dispatchUpdateSpaceLinkCoordinates,
        // #endregion dispatch
    } = properties;

    const planeControls = stateConfiguration.elements.plane.controls.show;

    const previewAppearTime = PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_IN;
    const previewDisappearTime = PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_OUT;

    const planeRouteResolved = computePlaneAddress(planeRoute);
    // console.log('planeRouteResolved', planeRouteResolved);

    const absolutePlaneRoute = resolveRoute(
        planeRouteResolved,
        stateConfiguration.network.protocol,
        stateConfiguration.network.host,
    );
    // console.log('absolutePlaneRoute', absolutePlaneRoute);
    // #endregion properties


    // #region context
    const context = useContext(Context);

    if (!context) {
        return (
            <>
                {children}
            </>
        );
    }

    const {
        planesRegistrar,
    } = context;

    const planesRegistry = getPlanesRegistrar(planesRegistrar);

    if (!planesRegistry) {
        return (
            <>
                {children}
            </>
        );
    }
    // #endregion context


    // #region references
    const linkElement: React.RefObject<HTMLAnchorElement> = useRef(null);
    const hoverInTimeout = useRef<null | NodeJS.Timeout>(null);
    const hoverOutTimeout = useRef<null | NodeJS.Timeout>(null);
    // #endregion references


    // #region state
    const [mouseOver, setMouseOver] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showLink, setShowLink] = useState(false);
    const [planeID, setPlaneID] = useState('');
    const [pluridPlaneID, setPluridPlaneID] = useState('');
    const [parentPlaneID, setParentPlaneID] = useState('');
    const [linkCoordinates, setLinkCoordinates] = useState(defaultLinkCoordinates);

    const [suffix, setSuffix] = useState(_suffix ?? PLURID_DEFAULT_CONFIGURATION_LINK_SUFFIX);
    const [devisible, setDevisible] = useState(_devisible ?? false);
    // #endregion state


    // #region handlers
    const getPluridLinkCoordinates = (): PluridLinkCoordinates => {
        const link = linkElement.current;
        // console.log('getPluridLinkCoordinates', link);

        if (!link) {
            return {
                ...defaultLinkCoordinates,
            };
        }

        let partialTop = 0;
        let partialLeft = 0;
        let staticSet = false;

        let element: HTMLElement = link;
        let searching = true;
        let top = 0;
        let left = 0;
        while (searching) {
            // console.log('in while loop', element);
            // console.log('in while loop top', element.offsetTop);
            // console.log('in while loop left', element.offsetLeft);

            if (window.getComputedStyle(element).position === 'static'
                && !staticSet
            ) {
                // console.log('static set', element);

                partialTop += element.offsetTop;
                partialLeft += element.offsetLeft;
                staticSet = true;
            }

            if (window.getComputedStyle(element).position === 'relative') {
                // console.log('partial added', element);

                top += partialTop;
                left += partialLeft;
                partialTop = 0;
                partialLeft = 0;
                staticSet = false;
            }

            if (element.scrollLeft) {
                left += -element.scrollLeft;
            }

            if (element.scrollTop) {
                top += -element.scrollTop;
            }

            if (
                element.parentElement
            ) {
                const pluridEntity = element.parentElement.dataset.pluridEntity;
                if (pluridEntity === 'PluridPlane') {
                    searching = false;
                }
                element = element.parentElement;
            } else {
                searching = false;
            }
        }

        // console.log('element', element);
        // console.log('link', link);
        // console.log('top', top);
        // console.log('left', left);

        const planeControlsHeight = planeControls ? 56 : 0;
        const x = left + link.offsetWidth;
        const y = top + planeControlsHeight;

        // console.log('x', x);
        // console.log('y', y);
        // console.log('---------');

        return {
            x,
            y,
        };
    }

    const updateLinkCoordinates = () => {
        const linkCoordinates = getPluridLinkCoordinates();

        const payload: UpdateSpaceLinkCoordinatesPayload = {
            planeID: pluridPlaneID,
            linkCoordinates,
        };
        dispatchUpdateSpaceLinkCoordinates(payload);
    }

    const updateTreeWithLink = () => {
        if (!parentPlaneID || !absolutePlaneRoute) {
            return;
        }

        const {
            route,
        } = absolutePlaneRoute;

        const linkCoordinates = getPluridLinkCoordinates();
        // console.log('planesRegistry', route, planesRegistry);
        const {
            pluridPlaneID,
            updatedTree,
        } = space.tree.logic.updateTreeWithNewPlane(
            route,
            parentPlaneID,
            linkCoordinates,
            stateTree,
            planesRegistry.getAll(),
            stateConfiguration,
        );

        if (pluridPlaneID) {
            dispatchSetTree(updatedTree);
            setShowLink(true);
            setPluridPlaneID(pluridPlaneID);
        }
    }

    const toggleLinkFromTree = () => {
        const updatedTree = space.tree.logic.togglePlaneFromTree(stateTree, pluridPlaneID);
        dispatchSetTree(updatedTree);
        setShowLink(show => !show);
        setShowPreview(false);
    }

    const handleShowPluridPlane = () => {
        if (!showLink && !pluridPlaneID) {
            updateTreeWithLink();
        } else {
            toggleLinkFromTree();
        }
    }

    const handleClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        if (atClick !== undefined) {
            atClick(event);
        }

        handleShowPluridPlane();
    }, [
        linkElement.current,
        stateTree,
    ]);
    // #endregion handlers


    // #region effects
    /** Set default suffix, devisible */
    useEffect(() => {
        if (_suffix !== undefined) {
            setSuffix(_suffix);
        }

        if (_devisible !== undefined) {
            setDevisible(_devisible);
        }
    }, [
        _suffix,
        _devisible,
    ]);

    /**
     * Update Link Coordinates
     */
    useEffect(() => {
        if (showLink) {
            updateLinkCoordinates();
        }
    }, [
        stateViewSize,
    ]);

    /**
     * Get Parent Plane ID
     * Get Plurid Link Coordinates
     */
    useEffect(() => {
        const parentPlaneID = getPluridPlaneIDByData(linkElement.current);
        setParentPlaneID(parentPlaneID);

        const linkCoordinates = getPluridLinkCoordinates();
        setLinkCoordinates(linkCoordinates);
    }, []);

    /** Show Preview */
    useEffect(() => {
        if (mouseOver && hoverOutTimeout.current) {
            hoverInTimeout.current = setTimeout(
                () => {
                    setShowPreview(true);
                },
                previewAppearTime,
            );

            clearTimeout(hoverOutTimeout.current);
        }

        if (!mouseOver) {
            hoverOutTimeout.current = setTimeout(
                () => {
                    setShowPreview(false);
                    if (hoverInTimeout.current) {
                        clearTimeout(hoverInTimeout.current);
                    }
                },
                previewDisappearTime,
            );
        }

        return () => {
            if (hoverOutTimeout.current) {
                clearTimeout(hoverOutTimeout.current);
            }
            if (hoverInTimeout.current) {
                clearTimeout(hoverInTimeout.current);
            }
        }
    }, [
        mouseOver,
    ]);

    /** Set plane ID */
    useEffect(() => {
        if (absolutePlaneRoute) {
            // const potentialPlaneRoute = statePlaneSources[absolutePlaneRoute.resolvedPath];

            // if (!potentialPlaneRoute) {
            //     for (const planeRoute of Object.keys(statePlaneSources)) {
            //         // check each one
            //     }
            // }

            // setPlaneID(potentialPlaneRoute);
        }
    }, []);
    // #endregion effects


    // #region render
    return (
        <StyledPluridLink
            ref={linkElement}
            onClick={(event: React.MouseEvent<HTMLAnchorElement>) => handleClick(event)}
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            theme={stateGeneralTheme}
            suffix={suffix}
            devisible={devisible}
            style={{
                ...style,
            }}
            className={className}
            data-plurid-entity={PLURID_ENTITY_LINK}
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
                        planeID={planeID}
                        linkCoordinates={linkCoordinates}
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
    dispatchSetTree: (
        tree: TreePlane[],
    ) => dispatch(
        actions.space.setTree(tree),
    ),
    dispatchUpdateSpaceLinkCoordinates: (
        payload: UpdateSpaceLinkCoordinatesPayload,
    ) => dispatch(
        actions.space.updateSpaceLinkCoordinates(payload)
    ),
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridLink);
// #endregion module
