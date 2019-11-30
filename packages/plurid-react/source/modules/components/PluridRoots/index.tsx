import React, {
    // useState,
    // useEffect,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    TreePage,
} from '@plurid/plurid-data';

// import {
//     rotateMatrix,
//     translateMatrix,
//     scaleMatrix,
//     multiplyArrayOfMatrices,
//     matrixArrayToCSSMatrix,
// } from '@plurid/plurid-engine';


import {
    StyledPluridRoots,
    StyledTransformOrigin,
} from './styled';

import PluridRoot from '../PluridRoot';


import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import { ViewSize } from '../../services/state/types/data';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



export interface PluridRootsOwnProperties {
}

interface PluridRootsStateProperties {
    interactionTheme: Theme;

    viewSize: ViewSize;
    planeWidth: number;
    animatedTransform: boolean;
    spaceScale: number;
    spaceRotationX: number;
    spaceRotationY: number;
    spaceTranslationX: number;
    spaceTranslationY: number;
    spaceTranslationZ: number;
    firstPerson: boolean;
    tree: TreePage[];
}

interface PluridRootsDispatchProperties {
}

type PluridRootsProperties = PluridRootsOwnProperties
    & PluridRootsStateProperties
    & PluridRootsDispatchProperties;

const PluridRoots: React.FC<PluridRootsProperties> = (properties) => {
    const {
        /** state */
        interactionTheme,
        // viewSize,
        // planeWidth,
        animatedTransform,
        spaceScale,
        spaceRotationX,
        spaceRotationY,
        spaceTranslationX,
        spaceTranslationY,
        spaceTranslationZ,
        // firstPerson,
        tree,
    } = properties;

    // const [cssMatrix, setCssMatrix] = useState('');

    // useEffect(() => {
    //     console.log(spaceRotationY);
    //     const rotationMatrix = rotateMatrix(spaceRotationX, spaceRotationY, 0);
    //     const translationMatrix = translateMatrix(spaceTranslationX, spaceTranslationY, 0);
    //     const scalationMatrix = scaleMatrix(spaceScale);

    //     const multiplicationMatrix = multiplyArrayOfMatrices([
    //         translationMatrix,
    //         rotationMatrix,
    //         scalationMatrix,
    //     ]);

    //     const cssMatrix = matrixArrayToCSSMatrix(multiplicationMatrix);
    //     setCssMatrix(cssMatrix);
    //     console.log(cssMatrix);
    // }, [
    //     spaceScale,
    //     spaceRotationX,
    //     spaceRotationY,
    //     spaceTranslationX,
    //     spaceTranslationY,
    // ]);

    const transformOriginX = spaceTranslationX * -1 + window.innerWidth/2;
    const transformOriginY = spaceTranslationY * -1 + window.innerHeight/2;
    const transformOriginZ = spaceTranslationZ * -1;

    return (
        <StyledPluridRoots
            style={{
                width: window.innerWidth + 'px',
                height: window.innerHeight + 'px',
                // width: viewSize.width + 'px',
                // height: viewSize.height + 'px',
                // transform: cssMatrix,
                transform: `
                    scale(${spaceScale})
                    translateX(${spaceTranslationX}px)
                    translateY(${spaceTranslationY}px)
                    translateZ(${spaceTranslationZ}px)
                    rotateX(${spaceRotationX}deg)
                    rotateY(${spaceRotationY}deg)
                `,
                transition: animatedTransform
                    ? 'transform 450ms ease-in-out'
                    // : firstPerson
                    //     ? 'transform 100ms linear'
                        : 'initial',
                transformOrigin: `
                    ${transformOriginX}px
                    ${transformOriginY}px
                    ${transformOriginZ}px
                `,
                // transformOrigin: `
                //     ${spaceTranslationX * -1 + window.innerWidth/2}px
                //     ${spaceTranslationY * - 1 + window.innerHeight/2}px
                //     ${spaceTranslationZ * -1}px
                // `,
            }}
        >
            <StyledTransformOrigin
                theme={interactionTheme}
                style={{
                    transform: `
                        rotateY(${-spaceRotationY}deg)
                        translateX(${transformOriginX}px)
                        translateY(${transformOriginY}px)
                        translateZ(${transformOriginZ}px)
                    `,
                    transformOrigin: `
                        ${transformOriginX}px
                        ${transformOriginY}px
                        ${transformOriginZ}px
                    `,
                }}
            />

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


const mapStateToProps = (
    state: AppState,
): PluridRootsStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),

    viewSize: selectors.data.getViewSize(state),
    planeWidth: selectors.configuration.getConfiguration(state).planeWidth,
    animatedTransform: selectors.space.getAnimatedTransform(state),
    spaceScale: selectors.space.getScale(state),
    spaceRotationX: selectors.space.getRotationX(state),
    spaceRotationY: selectors.space.getRotationY(state),
    spaceTranslationX: selectors.space.getTranslationX(state),
    spaceTranslationY: selectors.space.getTranslationY(state),
    spaceTranslationZ: selectors.space.getTranslationZ(state),
    firstPerson: selectors.space.getFirstPerson(state),
    tree: selectors.space.getTree(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
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
