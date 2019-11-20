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
    transform: any;
}

interface PluridRootsDispatchProperties {
}

type PluridRootsProperties = PluridRootsStateProperties & PluridRootsDispatchProperties & PluridRootsOwnProperties;

const PluridRoots: React.FC<PluridRootsProperties> = (properties) => {
    const {
        viewSize,
        planeWidth,
        spaceScale,
        spaceRotationX,
        spaceRotationY,
        spaceTranslationX,
        spaceTranslationY,
        tree,
        transform,
    } = properties;

    // console.log('transform', transform);
    // console.log('spaceRotationY', spaceRotationY);

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
    transform: selectors.space.getTransform(state),
    tree: selectors.space.getTree(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PluridRootsDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridRoots);
