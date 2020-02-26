import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    TreePage,
    PluridConfiguration,
    SIZES,
} from '@plurid/plurid-data';

import {
    StyledPluridRoots,
    StyledTransformOrigin,
} from './styled';

import PluridRoot from '../PluridRoot';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



export interface PluridRootsOwnProperties {
}

interface PluridRootsStateProperties {
    configuration: PluridConfiguration;
    interactionTheme: Theme;
    animatedTransform: boolean;
    spaceScale: number;
    spaceRotationX: number;
    spaceRotationY: number;
    spaceTranslationX: number;
    spaceTranslationY: number;
    spaceTranslationZ: number;
    stateTree: TreePage[];
}

interface PluridRootsDispatchProperties {
}

type PluridRootsProperties = PluridRootsOwnProperties
    & PluridRootsStateProperties
    & PluridRootsDispatchProperties;

const PluridRoots: React.FC<PluridRootsProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** state */
        configuration,
        interactionTheme,
        animatedTransform,
        spaceScale,
        spaceRotationX,
        spaceRotationY,
        spaceTranslationX,
        spaceTranslationY,
        spaceTranslationZ,
        stateTree,
    } = properties;

    const {
        space,
    } = configuration;

    const {
        // firstPerson,
        transformOrigin,
    } = space;

    const {
        show: showTransformOrigin,
        size: transformOriginSize,
    } = transformOrigin;

    const innerWidth = typeof window === 'undefined'
        ? 720
        : window.innerWidth/2;
    const innerHeight = typeof window === 'undefined'
        ? 400
        : window.innerHeight/2;

    const transformOriginX = spaceTranslationX * -1 + innerWidth;
    const transformOriginY = spaceTranslationY * -1 + innerHeight;
    const transformOriginZ = spaceTranslationZ * -1;

    const transformOriginSizeDifference = transformOriginSize === SIZES.SMALL
        ? 2.5
        : transformOriginSize === SIZES.NORMAL
            ? 5
            : 7.5;


    /** render */
    return (
        <StyledPluridRoots
            style={{
                width: window.innerWidth + 'px',
                height: window.innerHeight + 'px',
                transform: `
                    translateX(${spaceTranslationX}px)
                    translateY(${spaceTranslationY}px)
                    translateZ(${spaceTranslationZ}px)
                    scale(${spaceScale})
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
            }}
        >
            {showTransformOrigin && (
                <StyledTransformOrigin
                    theme={interactionTheme}
                    transformOriginSize={transformOriginSize}
                    style={{
                        transform: `
                            rotateY(${-spaceRotationY}deg)
                            translateX(${transformOriginX - transformOriginSizeDifference}px)
                            translateY(${transformOriginY - transformOriginSizeDifference}px)
                            translateZ(${(transformOriginZ + 5)}px)
                        `,
                        transformOrigin: `
                            ${transformOriginX - transformOriginSizeDifference}px
                            ${transformOriginY - transformOriginSizeDifference}px
                            ${transformOriginZ}px
                        `,
                    }}
                />
            )}

            {stateTree.map(page => {
                return (
                    <PluridRoot
                        key={page.planeID}
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
    configuration: selectors.configuration.getConfiguration(state),
    interactionTheme: selectors.themes.getInteractionTheme(state),
    animatedTransform: selectors.space.getAnimatedTransform(state),
    spaceScale: selectors.space.getScale(state),
    spaceRotationX: selectors.space.getRotationX(state),
    spaceRotationY: selectors.space.getRotationY(state),
    spaceTranslationX: selectors.space.getTranslationX(state),
    spaceTranslationY: selectors.space.getTranslationY(state),
    spaceTranslationZ: selectors.space.getTranslationZ(state),
    stateTree: selectors.space.getTree(state),
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
