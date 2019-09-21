import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledPluridRoots,
} from './styled';

import PluridRoot from '../PluridRoot';

import {
    TreePage,
} from '@plurid/plurid-data';

import { AppState } from '../../services/state/store';
import { ViewSize } from '../../services/state/types/data';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



export interface PluridRootsOwnProperties {
}

interface PluridRootsStateProperties {
    viewSize: ViewSize;
    planeWith: number;
    spaceScale: number;
    spaceRotationX: number;
    spaceRotationY: number;
    spaceTranslationX: number;
    spaceTranslationY: number;
    tree: TreePage[];
}

interface PluridRootsDispatchProperties {
}

type PluridRootsProperties = PluridRootsStateProperties & PluridRootsDispatchProperties & PluridRootsOwnProperties;

const PluridRoots: React.FC<PluridRootsProperties> = (properties) => {
    const {
        viewSize,
        planeWith,
        spaceScale,
        spaceRotationX,
        spaceRotationY,
        spaceTranslationX,
        spaceTranslationY,
        tree,
    } = properties;

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
                // transformOrigin: `${viewSize.width * planeWith/2}px ${spaceTranslationY}px`,
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
    planeWith: selectors.configuration.getConfiguration(state).planeWidth,
    spaceScale: selectors.space.getScale(state),
    spaceRotationX: selectors.space.getRotationX(state),
    spaceRotationY: selectors.space.getRotationY(state),
    spaceTranslationX: selectors.space.getTranslationX(state),
    spaceTranslationY: selectors.space.getTranslationY(state),
    tree: selectors.space.getTree(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PluridRootsDispatchProperties => ({
});


export default connect(mapStateToProps, mapDispatchToProps)(PluridRoots);
