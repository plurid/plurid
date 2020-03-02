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

    /** interfaces */
    PluridLink as PluridLinkOwnProperties,
    TreePage,
    Indexed,
    PluridInternalStateDocument,
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    router,
    space,
} from '@plurid/plurid-engine';

import {
    StyledPluridLink,
} from './styled';

import {
    getPluridPlaneIDByData,
} from '../../services/logic/plane';

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
    stateTree: TreePage[];
    stateGeneralTheme: Theme;
    stateActiveDocumentID: string;
    stateDocuments: Indexed<PluridInternalStateDocument>;
    stateConfiguration: PluridConfiguration,
    stateViewSize: ViewSize,
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
        page: pagePath,
        document,
        devisible: _devisible,
        suffix: _suffix,
        atClick,
        style,
        className,

        /** state */
        stateTree,
        stateGeneralTheme,
        stateActiveDocumentID,
        stateDocuments,
        stateConfiguration,
        stateViewSize,

        /** dispatch */
        dispatchSetTree,
        dispatchUpdateSpaceLinkCoordinates,
    } = properties;

    const planeControls = stateConfiguration.elements.plane.controls.show;


    /** references */
    const linkElement: React.RefObject<HTMLAnchorElement> = useRef(null);
    const hoverInTimeout = useRef<null | number>(null);
    const hoverOutTimeout = useRef<null | number>(null);


    /** state */
    const [mouseOver, setMouseOver] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showLink, setShowLink] = useState(false);
    const [pageID, setPageID] = useState('');
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

    const updateTreeWithLink = () => {
        const linkCoordinates = getPluridLinkCoordinates();

        const searchDocumentID = document ? document : stateActiveDocumentID;
        const activeDocument = stateDocuments[searchDocumentID];

        if (!activeDocument) {
            return;
        }

        const {
            // paths,
            pages,
        } = activeDocument;

        const pageByID = pages[pagePath];

        if (pageByID) {
            setPageID(pageByID.id);

            const {
                pluridPlaneID,
                updatedTree,
            } = space.tree.updateTreeWithNewPage(
                stateTree,
                parentPlaneID,
                pagePath,
                pageByID.id,
                linkCoordinates,
                {},
            );

            if (pluridPlaneID) {
                dispatchSetTree(updatedTree);
                setShowLink(true);
                setPluridPlaneID(pluridPlaneID);
            }

            return;
        }

        const routes: router.Route<any>[] = Object.values(pages).map(page => {
            const route: router.Route<any> =  {
                location: page.path,
                view: '',
            };
            return route;
        });

        const pagesRouter = new Router(routes);

        const matchedRoute = pagesRouter.match(pagePath);
        // console.log(matchedRoute);

        // const matchedPage = router.match(pagePath, Object.values(pages));
        // const matchedPage: any = undefined;

        if (matchedRoute) {
            const page = Object.values(pages).find(p => p.path === matchedRoute.route.location);
            if (!page) {
                return;
            }

            // const {
            //     route,
            //     parameters,
            // } = matchedPage;

            setPageID(page.id);

            const {
                pluridPlaneID,
                updatedTree,
            } = space.tree.updateTreeWithNewPage(
                stateTree,
                parentPlaneID,
                pagePath,
                page.id,
                linkCoordinates,
                // parameters: matchedRoute.parameters,
            );

            if (pluridPlaneID) {
                dispatchSetTree(updatedTree);
                setShowLink(true);
                setPluridPlaneID(pluridPlaneID);
            }
        }

        // let pathData = null;
        // for (const pathValue of Object.values(paths)) {
        //     // const re = new RegExp(pathValue.regex);
        //     // const match = pagePath.match(re);

        //     if (pathValue.address === pagePath) {
        //         pathData = {...pathValue};
        //         break;
        //     }
        // }

        // if (pathData) {
        //     console.log(pathData);

        //     const {
        //         pluridPlaneID,
        //         updatedTree,
        //     } = space.updateTreeWithNewPage(
        //         tree,
        //         parentPlaneID,
        //         pagePath,
        //         pathData.pageID,
        //         linkCoordinates,
        //         pathData.parameters,
        //     );

        //     if (pluridPlaneID) {
        //         dispatchSetTree(updatedTree);
        //         setShowLink(true);
        //         setPluridPlaneID(pluridPlaneID);
        //     }
        // }
    }

    const toggleLinkFromTree = () => {
        const updatedTree = space.tree.togglePageFromTree(stateTree, pluridPlaneID);
        dispatchSetTree(updatedTree);
        setShowLink(show => !show);
    }

    const updateLinkCoordinates = () => {
        const linkCoordinates = getPluridLinkCoordinates();

        const payload: UpdateSpaceLinkCoordinatesPayload = {
            planeID: pluridPlaneID,
            linkCoordinates,
        };
        dispatchUpdateSpaceLinkCoordinates(payload);
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
    /** Set Default suffix, devisible */
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


    const previewAppearTime = 400;
    const previewDisappearTime = 400;

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
                        document={document}
                        pageID={pageID}
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
    stateActiveDocumentID: selectors.space.getActiveDocumentID(state),
    stateDocuments: selectors.data.getDocuments(state),
    stateConfiguration: selectors.configuration.getConfiguration(state),
    stateViewSize: selectors.space.getViewSize(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridLinkDispatchProperties => ({
    dispatchSetTree: (
        tree: TreePage[],
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
