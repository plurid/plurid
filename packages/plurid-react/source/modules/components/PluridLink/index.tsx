import React, {
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
    /** constants */
    PLURID_DEFAULT_CONFIGURATION_LINK_SUFFIX,
    PLURID_ENTITY_LINK,
    PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_IN,
    PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_OUT,

    /** interfaces */
    PluridLink as PluridLinkOwnProperties,
    TreePlane,
    Indexed,
    PluridInternalStateUniverse,
    PluridConfiguration,
    // PluridRouterRoute,
} from '@plurid/plurid-data';

import {
    router,
    space,
    general as generalEngine,
} from '@plurid/plurid-engine';

import {
    StyledPluridLink,
} from './styled';


import Preview from './components/Preview';
import Portal from '../utilities/Portal';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';
import {
    ViewSize,
    UpdateSpaceLinkCoordinatesPayload,
} from '../../services/state/modules/space/types';



const {
    default: Router,
    resolveAbsolutePluridLinkPath,
} = router;

interface PluridLinkCoordinates {
    x: number;
    y: number;
}

const defaultLinkCoordinates: PluridLinkCoordinates = {
    x: 0,
    y: 0,
};

interface PluridLinkStateProperties {
    stateTree: TreePlane[];
    stateGeneralTheme: Theme;
    stateActiveUniverseID: string;
    stateUniverses: Indexed<PluridInternalStateUniverse>;
    stateConfiguration: PluridConfiguration,
    stateViewSize: ViewSize,
    statePlaneSources: Record<string, string>;
}

interface PluridLinkDispatchProperties {
    dispatchSetTree: typeof actions.space.setTree;
    dispatchUpdateSpaceLinkCoordinates: typeof actions.space.updateSpaceLinkCoordinates;
}

type PluridLinkProperties = PluridLinkOwnProperties
    & PluridLinkStateProperties
    & PluridLinkDispatchProperties;

const PluridLink: React.FC<React.PropsWithChildren<PluridLinkProperties>> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        children,
        path: planePath,
        // document,
        devisible: _devisible,
        suffix: _suffix,
        atClick,
        style,
        className,

        /** state */
        stateTree,
        stateGeneralTheme,
        // stateActiveUniverseID,
        // stateUniverses,
        stateConfiguration,
        stateViewSize,
        statePlaneSources,

        /** dispatch */
        dispatchSetTree,
        dispatchUpdateSpaceLinkCoordinates,
    } = properties;

    const planeControls = stateConfiguration.elements.plane.controls.show;

    const previewAppearTime = PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_IN;
    const previewDisappearTime = PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_OUT;

    const absolutePath = resolveAbsolutePluridLinkPath(planePath);
    // console.log('absolutePath', absolutePath);


    /** references */
    const linkElement: React.RefObject<HTMLAnchorElement> = useRef(null);
    const hoverInTimeout = useRef<null | number>(null);
    const hoverOutTimeout = useRef<null | number>(null);


    /** state */
    const [mouseOver, setMouseOver] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showLink, setShowLink] = useState(false);
    const [planeID, setPlaneID] = useState('');
    const [pluridPlaneID, setPluridPlaneID] = useState('');
    const [parentPlaneID, setParentPlaneID] = useState('');
    const [linkCoordinates, setLinkCoordinates] = useState(defaultLinkCoordinates);

    const [suffix, setSuffix] = useState(PLURID_DEFAULT_CONFIGURATION_LINK_SUFFIX);
    const [devisible, setDevisible] = useState(false);


    /** handlers */
    const getPluridLinkCoordinates = (): PluridLinkCoordinates => {
        const link = linkElement.current;

        if (!link) {
            return {
                ...defaultLinkCoordinates,
            };
        }

        const planeControlsHeight = planeControls ? 56 : 0;
        const x = link.offsetLeft + link.offsetWidth;
        const y = link.offsetTop + planeControlsHeight;

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
        if (!parentPlaneID || !absolutePath) {
            return;
        }

        const linkCoordinates = getPluridLinkCoordinates();

        const {
            pluridPlaneID,
            updatedTree,
        } = space.tree.logic.updateTreeWithNewPlane(
            absolutePath,
            parentPlaneID,
            linkCoordinates,
            stateTree,
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


    /** effects */
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
        const parentPlaneID = generalEngine.planes.getPluridPlaneIDByData(linkElement.current);
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
        console.log('absolutePlaneRoute', absolutePath);
        console.log('statePlaneRoutes', statePlaneSources);

        if (absolutePath) {
            const potentialPlaneRoute = statePlaneSources[absolutePath];

            if (!potentialPlaneRoute) {
                for (const planeRoute of Object.keys(statePlaneSources)) {
                    // check each one
                }
            }

            console.log('potentialPlaneRoute', potentialPlaneRoute);
            setPlaneID(potentialPlaneRoute);
        }


        // given the absolutePlaneRoute and the statePlaneRoutes
        // find the one matching




        // const searchUniverseID = document ? document : stateActiveUniverseID;
        // const activeUniverse = stateUniverses[searchUniverseID];

        // if (!activeUniverse) {
        //     return;
        // }

        // const {
        //     planes,
        // } = activeUniverse;

        // const routes: PluridRouterRoute<any>[] = Object.values(planes).map(plane => {
        //     const route: PluridRouterRoute<any> =  {
        //         path: plane.path,
        //         view: '',
        //     };
        //     return route;
        // });

        // const pagesRouter = new Router(routes);

        // const matchedRoute = pagesRouter.match(planePath);

        // if (!matchedRoute) {
        //     return;
        // }

        // const page = Object.values(planes).find(p => p.path === matchedRoute.route.path);
        // if (!page) {
        //     return;
        // }

        // setPlaneID(page.id);
    }, []);


    /** render */
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
                <Portal
                    elementID={`preview-${parentPlaneID}`}
                    rootID={parentPlaneID}
                >
                    <Preview
                        // document={document}
                        planeID={planeID}
                        linkCoordinates={linkCoordinates}
                    />
                </Portal>
            )}
        </StyledPluridLink>
    );
}


const mapStateToProperties = (
    state: AppState,
): PluridLinkStateProperties => ({
    stateTree: selectors.space.getTree(state),
    stateGeneralTheme: selectors.themes.getGeneralTheme(state),
    stateActiveUniverseID: selectors.space.getActiveUniverseID(state),
    stateUniverses: selectors.data.getUniverses(state),
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateViewSize: selectors.space.getViewSize(state),
    statePlaneSources: selectors.data.getPlaneSources(state),
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
