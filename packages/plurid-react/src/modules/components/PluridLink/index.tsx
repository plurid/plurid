import React, {
    useState,
    useRef,
    useCallback,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Theme } from '@plurid/utilities.themes';

import {
    StyledPluridLink,
} from './styled';

import {
    PluridLink as PluridLinkOwnProperties,
    TreePage,
} from '@plurid/plurid-data';

import {
    getPluridPlaneIDByData,
} from '../../services/logic/plane';

import {
    updateTreeWithNewPage,
    // removePageFromTree,
    // hidePageFromTree,
    // showPageFromTree,
    togglePageFromTree,
} from '@plurid/plurid-engine';

import { AppState } from '../../services/state/store';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';



interface PluridLinkStateProperties {
    tree: TreePage[],
    generalTheme: Theme,
}

interface PluridLinkDispatchProperties {
    setTree: typeof actions.space.setTree,
}

type PluridLinkProperties = PluridLinkOwnProperties
    & PluridLinkStateProperties
    & PluridLinkDispatchProperties;

interface PluridLinkCoordinates {
    x: number;
    y: number;
}

const PluridLink: React.FC<PluridLinkProperties> = (properties) => {
    const [showLink, setShowLink] = useState(false);
    const [pluridPlaneID, setPluridPlaneID] = useState('');

    const element: React.RefObject<HTMLAnchorElement> = useRef(null);

    const {
        children,
        page,

        tree,
        generalTheme,

        setTree,
    } = properties;


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

            const {
                pluridPlaneID,
                updatedTree,
            } = updateTreeWithNewPage(
                tree,
                parentPlaneID,
                page,
                linkCoordinates,
            );

            if (pluridPlaneID) {
                setTree(updatedTree);
                setShowLink(true);
                setPluridPlaneID(pluridPlaneID);
            }
        } else {
            const updatedTree = togglePageFromTree(tree, pluridPlaneID);
            setTree(updatedTree);
            setShowLink(show => !show);
        }
    }

    const handleClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        handleShowPluridPlane();
    }, [element.current, tree]);

    return (
        <StyledPluridLink
            theme={generalTheme}
            onClick={(event: React.MouseEvent<HTMLAnchorElement>) => handleClick(event)}
            ref={element}
        >
            {children}
        </StyledPluridLink>
    );
}


const mapStateToProps = (state: AppState): PluridLinkStateProperties => ({
    tree: selectors.space.getTree(state),
    generalTheme: selectors.themes.getGeneralTheme(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PluridLinkDispatchProperties => ({
    setTree: (tree: TreePage[]) => dispatch(actions.space.setTree(tree)),
});


export default connect(mapStateToProps, mapDispatchToProps)(PluridLink);
