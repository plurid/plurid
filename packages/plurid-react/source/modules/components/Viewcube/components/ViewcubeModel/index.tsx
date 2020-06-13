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
} from '@plurid/plurid-engine';

import {
    StyledPluridViewcubeModel,
    StyledPluridViewcubeModelContainer,
    StyledPluridViewcubeModelCube,
} from './styled';

import ViewcubeFace from '../ViewcubeFace';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



export interface PluridViewcubeModelOwnProperties {
    mouseOver: boolean;
}

export interface PluridViewcubeModelStateProperties {
    stateLanguage: InternationalizationLanguageType;
    spaceRotationX: number;
    spaceRotationY: number;
}

export interface PluridViewcubeModelDispatchProperties {
}

export type PluridViewcubeModelProperties = PluridViewcubeModelOwnProperties
    & PluridViewcubeModelStateProperties
    & PluridViewcubeModelDispatchProperties;

const PluridViewcubeModel: React.FC<PluridViewcubeModelProperties> = (
    properties,
) => {
    const {
        /** own */
        mouseOver,

        /** state */
        stateLanguage,
        spaceRotationX,
        spaceRotationY,

        /** dispatch */
    } = properties;

    const [hoveredZone, setHoveredZone] = useState('');
    const [activeZone, setActiveZone] = useState('');

    const handleMouseLeave = () => {
        setHoveredZone('');
    }

    useEffect(() => {
        if (!hoveredZone) {
            setActiveZone('');
        }
    }, [
        spaceRotationX,
        spaceRotationY,
    ]);

    return (
        <StyledPluridViewcubeModel>
            <StyledPluridViewcubeModelContainer>
                <StyledPluridViewcubeModelCube
                    suppressHydrationWarning={true}
                    style={{
                        transform: `
                            translateX(32px)
                            translateY(23px)
                            rotateX(${spaceRotationX}deg)
                            rotateY(${spaceRotationY}deg)
                        `,
                        transition: mouseOver ? 'transform 450ms ease-in-out' : '',
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
}


const mapStateToProperties = (
    state: AppState,
): PluridViewcubeModelStateProperties => ({
    stateLanguage: selectors.configuration.getConfiguration(state).language,
    spaceRotationX: selectors.space.getRotationX(state),
    spaceRotationY: selectors.space.getRotationY(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridViewcubeModelDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PluridViewcubeModel);
