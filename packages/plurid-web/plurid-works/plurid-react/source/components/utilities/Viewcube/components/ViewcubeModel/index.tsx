// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';


    import {
        InternationalizationLanguageType,
        internationalization,
    } from '@plurid/plurid-data';

    import {
        internatiolate,
        interaction,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import ViewcubeFace from '../ViewcubeFace';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPluridViewcubeModel,
        StyledPluridViewcubeModelContainer,
        StyledPluridViewcubeModelCube,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    matrixArrayToCSSMatrix,
    rotateMatrix,
    multiplyArrayOfMatrices,
    scaleMatrix,
    translateMatrix,
} = interaction.matrix;

const {
    degToRad,
} = interaction.quaternion;


export interface PluridViewcubeModelOwnProperties {
    mouseOver: boolean;
}

export interface PluridViewcubeModelStateProperties {
    stateLanguage: InternationalizationLanguageType;
    spaceRotationX: number;
    spaceRotationY: number;
    stateAnimatedTransform: boolean;
    stateTransformTime: number;
}

export interface PluridViewcubeModelDispatchProperties {
}

export type PluridViewcubeModelProperties =
    & PluridViewcubeModelOwnProperties
    & PluridViewcubeModelStateProperties
    & PluridViewcubeModelDispatchProperties;


const PluridViewcubeModel: React.FC<PluridViewcubeModelProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region own
        mouseOver,
        // #endregion own

        // #region state
        stateLanguage,
        spaceRotationX,
        spaceRotationY,
        stateAnimatedTransform,
        stateTransformTime,
        // #endregion state
    } = properties;
    // #endregion properties


    // #region state
    const [hoveredZone, setHoveredZone] = useState('');
    const [activeZone, setActiveZone] = useState('');
    // #endregion state


    // #region handlers
    const handleMouseLeave = () => {
        setHoveredZone('');
    }

    const computeTransform = () => {
        const offsets = {
            x: 32,
            y: 23,
            z: 0,
        };
        const transformOrigins = {
            x: 0,
            y: 0,
            z: 0,
        };
        const scale = 1;

        const rotationMatrix = rotateMatrix(degToRad(-spaceRotationX), degToRad(-spaceRotationY));
        const translationMatrix = translateMatrix(offsets.x, offsets.y, offsets.z);
        const scalationMatrix = scaleMatrix(scale);

        const transformMatrix = multiplyArrayOfMatrices([
            translationMatrix,
            multiplyArrayOfMatrices([
                translateMatrix(transformOrigins.x, transformOrigins.y, transformOrigins.z),
                rotationMatrix,
                translateMatrix(-transformOrigins.x, -transformOrigins.y, -transformOrigins.z),
            ]),
            scalationMatrix,
        ]);

        const transform = matrixArrayToCSSMatrix(transformMatrix);

        return transform;
    }
    // #endregion handlers


    // #region effects
    useEffect(() => {
        if (!hoveredZone) {
            setActiveZone('');
        }
    }, [
        spaceRotationX,
        spaceRotationY,
    ]);
    // #endregion effects


    // #region render
    const transform = computeTransform();

    return (
        <StyledPluridViewcubeModel>
            <StyledPluridViewcubeModelContainer>
                <StyledPluridViewcubeModelCube
                    suppressHydrationWarning={true}
                    style={{
                        transform,
                        transition: mouseOver || stateAnimatedTransform
                            ? `transform ${stateTransformTime}ms ease-in-out`
                            : '',
                    }}
                    onMouseLeave={() => handleMouseLeave()}
                >
                    <ViewcubeFace
                        face="front"
                        faceText={internatiolate(stateLanguage, internationalization.fields.viewcubeFront)}
                        mouseOver={mouseOver}
                        hoveredZone={hoveredZone}
                        setHoveredZone={setHoveredZone}
                        activeZone={activeZone}
                        setActiveZone={setActiveZone}
                    />
                    <ViewcubeFace
                        face="back"
                        faceText={internatiolate(stateLanguage, internationalization.fields.viewcubeBack)}
                        mouseOver={mouseOver}
                        hoveredZone={hoveredZone}
                        setHoveredZone={setHoveredZone}
                        activeZone={activeZone}
                        setActiveZone={setActiveZone}
                    />
                    <ViewcubeFace
                        face="left"
                        faceText={internatiolate(stateLanguage, internationalization.fields.viewcubeLeft)}
                        mouseOver={mouseOver}
                        hoveredZone={hoveredZone}
                        setHoveredZone={setHoveredZone}
                        activeZone={activeZone}
                        setActiveZone={setActiveZone}
                    />
                    <ViewcubeFace
                        face="right"
                        faceText={internatiolate(stateLanguage, internationalization.fields.viewcubeRight)}
                        mouseOver={mouseOver}
                        hoveredZone={hoveredZone}
                        setHoveredZone={setHoveredZone}
                        activeZone={activeZone}
                        setActiveZone={setActiveZone}
                    />
                    <ViewcubeFace
                        face="top"
                        faceText={internatiolate(stateLanguage, internationalization.fields.viewcubeTop)}
                        mouseOver={mouseOver}
                        hoveredZone={hoveredZone}
                        setHoveredZone={setHoveredZone}
                        activeZone={activeZone}
                        setActiveZone={setActiveZone}
                    />
                    <ViewcubeFace
                        face="base"
                        faceText={internatiolate(stateLanguage, internationalization.fields.viewcubeBase)}
                        mouseOver={mouseOver}
                        hoveredZone={hoveredZone}
                        setHoveredZone={setHoveredZone}
                        activeZone={activeZone}
                        setActiveZone={setActiveZone}
                    />
                </StyledPluridViewcubeModelCube>
            </StyledPluridViewcubeModelContainer>
        </StyledPluridViewcubeModel>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PluridViewcubeModelStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).global.language,
    spaceRotationX: selectors.space.getRotationX(state),
    spaceRotationY: selectors.space.getRotationY(state),
    stateAnimatedTransform: selectors.space.getAnimatedTransform(state),
    stateTransformTime: selectors.space.getTransformTime(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridViewcubeModelDispatchProperties => ({
});


const ConnectedPluridViewcubeModel = connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridViewcubeModel);
// #endregion module



// #region exports
export default ConnectedPluridViewcubeModel;
// #endregion exports
