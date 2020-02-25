import React, {
    useState,
    useRef,
    useCallback,
    useEffect,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Theme } from '@plurid/plurid-themes';

import {
    StyledPluridLink,
} from './styled';

import {
    PluridLink as PluridLinkOwnProperties,
    TreePage,
    Indexed,
    PluridInternalStateDocument,
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    getPluridPlaneIDByData,
} from '../../services/logic/plane';

import {
    router,
    space,
} from '@plurid/plurid-engine';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';
import {
    ViewSize,
    UpdateSpaceLinkCoordinatesPayload,
} from '../../services/state/modules/space/types';



const DEFAULT_SUFIX = "'";

interface PluridLinkStateProperties {
    tree: TreePage[];
    generalTheme: Theme;
    activeDocumentID: string;
    documents: Indexed<PluridInternalStateDocument>;
    configuration: PluridConfiguration,
    viewSize: ViewSize,
}

interface PluridLinkDispatchProperties {
    dispatchSetTree: typeof actions.space.setTree;
    dispatchUpdateSpaceLinkCoordinates: typeof actions.space.updateSpaceLinkCoordinates;
}

type PluridLinkProperties = PluridLinkOwnProperties
    & PluridLinkStateProperties
    & PluridLinkDispatchProperties;

interface PluridLinkCoordinates {
    x: number;
    y: number;
}

const PluridLink: React.FC<React.PropsWithChildren<PluridLinkProperties>> = (properties) => {
    const linkElement: React.RefObject<HTMLAnchorElement> = useRef(null);

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
        tree,
        generalTheme,
        activeDocumentID,
        documents,
        configuration,
        viewSize,

        /** dispatch */
        dispatchSetTree,
        dispatchUpdateSpaceLinkCoordinates,
    } = properties;

    const planeControls = configuration.elements.plane.controls.show;

    const [showLink, setShowLink] = useState(false);
    const [pluridPlaneID, setPluridPlaneID] = useState('');

    const [suffix, setSuffix] = useState(DEFAULT_SUFIX);
    const [devisible, setDevisible] = useState(false);

    const getPluridLinkCoordinates = (): PluridLinkCoordinates => {
        const planeControlsHeight = planeControls ? 56 : 0;
        const x = linkElement.current!.offsetLeft + linkElement.current!.offsetWidth;
        const y = linkElement.current!.offsetTop + planeControlsHeight;

        const pluridLinkCoordinates: PluridLinkCoordinates = {
            x,
            y,
        };
        return pluridLinkCoordinates;
    }

    const updateTreeWithLink = () => {
        const parentPlaneID = getPluridPlaneIDByData(linkElement.current);

        const linkCoordinates = getPluridLinkCoordinates();

        const searchDocumentID = document ? document : activeDocumentID;
        console.log('searchDocumentID', searchDocumentID);
        const activeDocument = documents[searchDocumentID];

        if (!activeDocument) {
            return;
        }

        const {
            // paths,
            pages,
        } = activeDocument;

        const pageByID = pages[pagePath]

        if (pageByID) {
            const {
                pluridPlaneID,
                updatedTree,
            } = space.updateTreeWithNewPage(
                tree,
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

        const matchedPage = router.match(pagePath, Object.values(pages));
        if (matchedPage) {
            const {
                route,
                parameters,
            } = matchedPage;

            const {
                pluridPlaneID,
                updatedTree,
            } = space.updateTreeWithNewPage(
                tree,
                parentPlaneID,
                pagePath,
                route.id,
                linkCoordinates,
                parameters,
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
        const updatedTree = space.togglePageFromTree(tree, pluridPlaneID);
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
        tree,
    ]);

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
        viewSize,
    ]);

    return (
        <StyledPluridLink
            ref={linkElement}
            onClick={(event: React.MouseEvent<HTMLAnchorElement>) => handleClick(event)}
            theme={generalTheme}
            suffix={suffix}
            devisible={devisible}
            style={{
                ...style,
            }}
            className={className}
        >
            {children}
        </StyledPluridLink>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridLinkStateProperties => ({
    tree: selectors.space.getTree(state),
    generalTheme: selectors.themes.getGeneralTheme(state),
    activeDocumentID: selectors.space.getActiveDocumentID(state),
    documents: selectors.data.getDocuments(state),
    configuration: selectors.configuration.getConfiguration(state),
    viewSize: selectors.space.getViewSize(state),
});


const mapDispatchToProps = (
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
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridLink);
