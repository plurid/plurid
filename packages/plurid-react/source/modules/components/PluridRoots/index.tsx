import React, {
    // useState,
    // useEffect,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledPluridRoots,
} from './styled';

import PluridRoot from '../PluridRoot';

import {
    TreePage,
    Indexed,
    PluridInternalStateDocument,
} from '@plurid/plurid-data';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import { ViewSize } from '../../services/state/types/data';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



export interface PluridRootsOwnProperties {
}

interface PluridRootsStateProperties {
    viewSize: ViewSize;
    planeWidth: number;
    spaceScale: number;
    spaceRotationX: number;
    spaceRotationY: number;
    spaceTranslationX: number;
    spaceTranslationY: number;
    tree: TreePage[];
    documents: Indexed<PluridInternalStateDocument>;
    activeDocumentID: string;
}

interface PluridRootsDispatchProperties {
}

type PluridRootsProperties = PluridRootsStateProperties & PluridRootsDispatchProperties & PluridRootsOwnProperties;

const PluridRoots: React.FC<PluridRootsProperties> = (properties) => {
    const {
        /** state */
        // viewSize,
        // planeWidth,
        spaceScale,
        spaceRotationX,
        spaceRotationY,
        spaceTranslationX,
        spaceTranslationY,
        tree,
        // documents,
        // activeDocumentID,
    } = properties;

    // const activeDocument = documents[activeDocumentID];
    // const {
    //     pages,
    // } = activeDocument;
    // // console.log(pages);

    // // traverse tree and push the roots into
    // const [roots, setRoots] = useState<TreePage[]>([]);

    // useEffect(() => {
    //     const roots: TreePage[] = [];

    //     if (!Array.isArray(pages)) {
    //         for (const pageID in pages) {
    //             const pluridPage = pages[pageID];
    //             if (pluridPage.root) {
    //                 const page: TreePage = {
    //                     planeID: pluridPage.id || '',
    //                     location: {
    //                         rotateX: 0,
    //                         rotateY: 0,
    //                         translateX: 0,
    //                         translateY: 0,
    //                         translateZ: 0,
    //                     },
    //                     path: pluridPage.path,
    //                     show: true,
    //                 };
    //                 roots.push(page);
    //             }
    //         }
    //     }

    //     setRoots(roots);
    // }, [
    //     tree,
    // ]);

    return (
        <StyledPluridRoots
            style={{
                width: window.innerWidth + 'px',
                height: window.innerHeight + 'px',
                // width: viewSize.width + 'px',
                // height: viewSize.height + 'px',
                transform: `
                    scale(${spaceScale})
                    translateX(${spaceTranslationX}px)
                    translateY(${spaceTranslationY}px)
                    rotateX(${spaceRotationX}deg)
                    rotateY(${spaceRotationY}deg)
                `,
                // transformOrigin: `${viewSize.width * planeWidth/2}px ${spaceTranslationY}px`,
            }}
        >
            {tree.map(page => {
                return (
                    <PluridRoot
                        key={page.path}
                        page={page}
                    />
                );
            })}
        </StyledPluridRoots>
    );
}


const mapStateToProps = (state: AppState): PluridRootsStateProperties => ({
    viewSize: selectors.data.getViewSize(state),
    planeWidth: selectors.configuration.getConfiguration(state).planeWidth,
    spaceScale: selectors.space.getScale(state),
    spaceRotationX: selectors.space.getRotationX(state),
    spaceRotationY: selectors.space.getRotationY(state),
    spaceTranslationX: selectors.space.getTranslationX(state),
    spaceTranslationY: selectors.space.getTranslationY(state),
    tree: selectors.space.getTree(state),
    documents: selectors.data.getDocuments(state),
    activeDocumentID: selectors.space.getActiveDocumentID(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>
): PluridRootsDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridRoots);
