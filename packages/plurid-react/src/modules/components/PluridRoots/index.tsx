import React, {
    useContext,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledPluridRoots,
} from './styled';

import Context from '../../../App/View/context';

// import {
//     PluridPage,
// } from '../../data/interfaces';

import PluridPlane from '../PluridPlane';

import { AppState } from '../../services/state/store';
import { ViewSize } from '../../services/state/types/data';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';



export interface PluridRootsOwnProperties {
}

interface PluridRootsStateProperties {
    viewSize: ViewSize;
    spaceScale: number;
    spaceRotationX: number;
    spaceRotationY: number;
    spaceTranslationX: number;
    spaceTranslationY: number;
}

interface PluridRootsDispatchProperties {
}

type PluridRootsProperties = PluridRootsStateProperties & PluridRootsDispatchProperties & PluridRootsOwnProperties;

const PluridRoots: React.FC<PluridRootsProperties> = (properties) => {
    const context: any = useContext(Context);
    // console.log(context);

    const {
        viewSize,
        spaceScale,
        spaceRotationX,
        spaceRotationY,
        spaceTranslationX,
        spaceTranslationY,
    } = properties;

    const {
        pages,
    } = context;

    return (
        <StyledPluridRoots
            style={{
                width: viewSize.width + 'px',
                height: viewSize.height + 'px',
                transform: `
                    translateX(${spaceTranslationX}px)
                    translateY(${spaceTranslationY}px)
                    rotateX(${spaceRotationX}deg)
                    rotateY(${spaceRotationY}deg)
                    scale(${spaceScale})
                `,
            }}
        >
            {pages.map((page: any) => {
                const Page = page.component.element;
                return (
                    <PluridPlane
                        key={page.path}
                        page={page}
                    >
                        <Page />
                    </PluridPlane>
                );
            })}
        </StyledPluridRoots>
    );
}


const mapStateToProps = (state: AppState): PluridRootsStateProperties => ({
    viewSize: selectors.data.getViewSize(state),
    spaceScale: selectors.space.getScale(state),
    spaceRotationX: selectors.space.getRotationX(state),
    spaceRotationY: selectors.space.getRotationY(state),
    spaceTranslationX: selectors.space.getTranslationX(state),
    spaceTranslationY: selectors.space.getTranslationY(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PluridRootsDispatchProperties => ({
});


export default connect(mapStateToProps, mapDispatchToProps)(PluridRoots);
