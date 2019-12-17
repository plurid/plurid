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
    updateTreeWithNewPage,
    togglePageFromTree,
} from '@plurid/plurid-engine';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';
import {
    ViewSize,
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
    setTree: typeof actions.space.setTree;
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

        /** state */
        tree,
        generalTheme,
        activeDocumentID,
        documents,
        configuration,
        viewSize,

        /** dispatch */
        setTree,
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

        return {
            x,
            y,
        };
    }

    const updateTreeWithLink = () => {
        const parentPlaneID = getPluridPlaneIDByData(linkElement.current);

        const linkCoordinates = getPluridLinkCoordinates();
        console.log(parentPlaneID, linkCoordinates);

        const searchDocumentID = document ? document : activeDocumentID;
        const activeDocument = documents[searchDocumentID];

        const {
            paths,
        } = activeDocument;

        let pathData = null;
        for (const pathValue of Object.values(paths)) {
            const re = new RegExp(pathValue.regex);
            const match = pagePath.match(re);

            if (match) {
                pathData = {...pathValue};
                break;
            }
        }

        if (pathData) {
            // console.log(pathData);

            const {
                pluridPlaneID,
                updatedTree,
            } = updateTreeWithNewPage(
                tree,
                parentPlaneID,
                pagePath,
                pathData.pageID,
                linkCoordinates,
                pathData.parameters,
            );

            if (pluridPlaneID) {
                setTree(updatedTree);
                setShowLink(true);
                setPluridPlaneID(pluridPlaneID);
            }
        }
    }

    const toggleLinkFromTree = () => {
        const updatedTree = togglePageFromTree(tree, pluridPlaneID);
        setTree(updatedTree);
        setShowLink(show => !show);
    }

    const updateTreeWithLinkCoordinates = () => {
        const parentPlaneID = getPluridPlaneIDByData(linkElement.current);

        const linkCoordinates = getPluridLinkCoordinates();

        console.log(parentPlaneID, linkCoordinates);

        // const {
        //     pluridPlaneID,
        //     updatedTree,
        // } = updateTreeWithNewPage(
        //     tree,
        //     parentPlaneID,
        //     pagePath,
        //     pathData.pageID,
        //     linkCoordinates,
        //     pathData.parameters,
        // );

        // if (pluridPlaneID) {
        //     setTree(updatedTree);
        //     setShowLink(true);
        //     setPluridPlaneID(pluridPlaneID);
        // }

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
            updateTreeWithLinkCoordinates();
            console.log(`link ${pluridPlaneID} has modified`);
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


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PluridLinkDispatchProperties => ({
    setTree: (tree: TreePage[]) => dispatch(actions.space.setTree(tree)),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridLink);
