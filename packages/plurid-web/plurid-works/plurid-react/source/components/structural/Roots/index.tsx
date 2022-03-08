// #region imports
    // #region libraries
    import React from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        /** constants */
        PLURID_ENTITY_TRANSFORM_ORIGIN,
        PLURID_ENTITY_ROOTS,

        /** enumerations */
        SIZES,

        /** interfaces */
        TreePlane,
        PluridConfiguration,
    } from '@plurid/plurid-data';

    import {
        cleanTemplate,
        interaction,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import PluridRoot from '../Root';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridRoots,
        StyledTransformOrigin,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    quaternion,
    matrix,
} = interaction;

const {
    matrixArrayToCSSMatrix,
    rotateMatrix,
    multiplyArrayOfMatrices,
    scaleMatrix,
    translateMatrix,
} = matrix;

const {
    degToRad,
} = quaternion;

export interface PluridRootsOwnProperties {
}

export interface PluridRootsStateProperties {
    stateConfiguration: PluridConfiguration;
    interactionTheme: Theme;
    spaceTransformMatrix: string;
    animatedTransform: boolean;
    transformTime: number;
    spaceScale: number;
    spaceRotationX: number;
    spaceRotationY: number;
    spaceTranslationX: number;
    spaceTranslationY: number;
    spaceTranslationZ: number;
    stateTree: TreePlane[];
}

export interface PluridRootsDispatchProperties {
}

export type PluridRootsProperties =
    & PluridRootsOwnProperties
    & PluridRootsStateProperties
    & PluridRootsDispatchProperties;


const PluridRoots: React.FC<PluridRootsProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region state
        stateConfiguration,
        interactionTheme,
        spaceTransformMatrix,
        animatedTransform,
        transformTime,
        spaceScale,
        spaceRotationX,
        spaceRotationY,
        spaceTranslationX,
        spaceTranslationY,
        spaceTranslationZ,
        stateTree,
        // #endregion state
    } = properties;

    const {
        space,
    } = stateConfiguration;

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
        : window.innerWidth / 2;
    const innerHeight = typeof window === 'undefined'
        ? 400
        : window.innerHeight / 2;

    const transformOriginX = spaceTranslationX * -1 + innerWidth;
    const transformOriginY = spaceTranslationY * -1 + innerHeight;
    const transformOriginZ = spaceTranslationZ * -1;

    const transformOriginSizeDifference = transformOriginSize === SIZES.SMALL
        ? 2.5
        : transformOriginSize === SIZES.NORMAL
            ? 5
            : 7.5;
    // #endregion properties


    // #region render
    const rotationMatrix = rotateMatrix(degToRad(-spaceRotationX), degToRad(-spaceRotationY));
    const translationMatrix = translateMatrix(spaceTranslationX, spaceTranslationY, spaceTranslationZ);
    const scalationMatrix = scaleMatrix(spaceScale);

    const transformMatrix = multiplyArrayOfMatrices([
        translationMatrix,
        multiplyArrayOfMatrices([
            translateMatrix(transformOriginX, transformOriginY, transformOriginZ),
            rotationMatrix,
            translateMatrix(-transformOriginX, -transformOriginY, -transformOriginZ),
        ]),
        scalationMatrix,
    ]);

    const transform = matrixArrayToCSSMatrix(transformMatrix);


    return (
        <StyledPluridRoots
            suppressHydrationWarning={true}
            style={{
                // width: typeof window !== 'undefined' ? window.innerWidth + 'px' : '1440px',
                width: '100%', // TOFIX
                height: typeof window !== 'undefined' ? window.innerHeight + 'px' : '821px',
                transform,
                transition: animatedTransform
                    ? `transform ${transformTime}ms ease-in-out`
                    // : firstPerson
                    //     ? 'transform 100ms linear'
                        : 'initial',
            }}
            data-plurid-entity={PLURID_ENTITY_ROOTS}
        >
            {showTransformOrigin && (
                <StyledTransformOrigin
                    suppressHydrationWarning={true}
                    theme={interactionTheme}
                    transformOriginSize={transformOriginSize}
                    style={{
                        transform: cleanTemplate(`
                            rotateY(${-spaceRotationY}deg)
                            translateX(${transformOriginX - transformOriginSizeDifference}px)
                            translateY(${transformOriginY - transformOriginSizeDifference}px)
                            translateZ(${(transformOriginZ + 5)}px)
                        `),
                        transformOrigin: cleanTemplate(`
                            ${transformOriginX - transformOriginSizeDifference}px
                            ${transformOriginY - transformOriginSizeDifference}px
                            ${transformOriginZ}px
                        `),
                    }}
                    data-plurid-entity={PLURID_ENTITY_TRANSFORM_ORIGIN}
                />
            )}

            {stateTree.map(plane => {
                return (
                    <PluridRoot
                        key={plane.planeID}
                        plane={plane}
                    />
                );
            })}
        </StyledPluridRoots>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridRootsStateProperties => ({
    stateConfiguration: selectors.configuration.getConfiguration(state),
    interactionTheme: selectors.themes.getInteractionTheme(state),
    spaceTransformMatrix: selectors.space.getTransformMatrix(state),
    animatedTransform: selectors.space.getAnimatedTransform(state),
    transformTime: selectors.space.getTransformTime(state),
    spaceScale: selectors.space.getScale(state),
    spaceRotationX: selectors.space.getRotationX(state),
    spaceRotationY: selectors.space.getRotationY(state),
    spaceTranslationX: selectors.space.getTranslationX(state),
    spaceTranslationY: selectors.space.getTranslationY(state),
    spaceTranslationZ: selectors.space.getTranslationZ(state),
    stateTree: selectors.space.getTree(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridRootsDispatchProperties => ({
});


const ConnectedPluridRoots = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridRoots);
// #endregion module



// #region exports
export default ConnectedPluridRoots;
// #endregion exports
