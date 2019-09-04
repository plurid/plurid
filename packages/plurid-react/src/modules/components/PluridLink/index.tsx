import React, {
    useState,
    useRef,
    useCallback,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledPluridLink,
} from './styled';

import {
    PluridLinkOwnProperties,
} from '../../data/interfaces';

import {
    getPluridPlaneIDByData,
} from '../../services/logic/plane';

import {
    updateTreeWithNewPage,
    removePageFromTree,
} from '../../services/logic/space';

import {
    TreePage,
} from '../../data/interfaces';

import { AppState } from '../../services/state/store';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';



interface PluridLinkStateProperties {
    tree: TreePage[],
}

interface PluridLinkDispatchProperties {
    setTree: typeof actions.space.setTree,
}

type PluridLinkProperties = PluridLinkOwnProperties
    & PluridLinkStateProperties
    & PluridLinkDispatchProperties;

const PluridLink: React.FC<PluridLinkProperties> = (properties) => {
    const [showLink, setShowLink] = useState(false);
    const [pluridPlaneID, setPluridPlaneID] = useState('');

    const element: React.RefObject<HTMLAnchorElement> = useRef(null);

    const {
        children,
        page,

        tree,

        setTree,
    } = properties;

    const handleClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (!showLink) {
            const parentPlaneID = getPluridPlaneIDByData(element.current);
            const updatedTree = updateTreeWithNewPage(
                tree,
                parentPlaneID,
                page,
            );

            if (Array.isArray(updatedTree)) {
                setTree(updatedTree);
                setShowLink(true);
            } else {
                const {
                    tree,
                    pluridPlaneID,
                } = updatedTree;

                setTree(tree);
                setShowLink(true);
                setPluridPlaneID(pluridPlaneID);
            }
        } else {
            const updatedTree = removePageFromTree(tree, pluridPlaneID);
            setTree(updatedTree);
            setShowLink(false);
            setPluridPlaneID('');
        }
    }, [element.current, tree]);

    return (
        <StyledPluridLink
            onClick={(event: React.MouseEvent<HTMLAnchorElement>) => handleClick(event)}
            ref={element}
        >
            {children}
        </StyledPluridLink>
    );
}


const mapStateToProps = (state: AppState): PluridLinkStateProperties => ({
    tree: selectors.space.getTree(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PluridLinkDispatchProperties => ({
    setTree: (tree: TreePage[]) => dispatch(actions.space.setTree(tree)),
});


export default connect(mapStateToProps, mapDispatchToProps)(PluridLink);
