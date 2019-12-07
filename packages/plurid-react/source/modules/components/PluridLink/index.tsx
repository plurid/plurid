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



const DEFAULT_SUFIX = "'";

interface PluridLinkStateProperties {
    tree: TreePage[];
    generalTheme: Theme;
    activeDocumentID: string;
    documents: Indexed<PluridInternalStateDocument>;
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
    const [showLink, setShowLink] = useState(false);
    const [pluridPlaneID, setPluridPlaneID] = useState('');

    const element: React.RefObject<HTMLAnchorElement> = useRef(null);

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

        /** dispatch */
        setTree,
    } = properties;

    const [suffix, setSuffix] = useState(DEFAULT_SUFIX);
    const [devisible, setDevisible] = useState(false);

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

    const getPluridLinkCoordinates = (): PluridLinkCoordinates => {
        const x = element.current!.offsetLeft + element.current!.offsetWidth;
        const y = element.current!.offsetTop;

        return {
            x,
            y,
        };
    }

    const handleShowPluridPlane = () => {
        if (!showLink && !pluridPlaneID) {
            const parentPlaneID = getPluridPlaneIDByData(element.current);

            const linkCoordinates = getPluridLinkCoordinates();

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
                const {
                    pluridPlaneID,
                    updatedTree,
                } = updateTreeWithNewPage(
                    tree,
                    parentPlaneID,
                    pagePath,
                    pathData.pageID,
                    linkCoordinates,
                    // pathData.parameters,
                );

                if (pluridPlaneID) {
                    setTree(updatedTree);
                    setShowLink(true);
                    setPluridPlaneID(pluridPlaneID);
                }
            }
        } else {
            const updatedTree = togglePageFromTree(tree, pluridPlaneID);
            setTree(updatedTree);
            setShowLink(show => !show);
        }
    }

    const handleClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        if (atClick !== undefined) {
            atClick(event);
        }

        handleShowPluridPlane();
    }, [
        element.current,
        tree,
    ]);

    return (
        <StyledPluridLink
            ref={element}
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
