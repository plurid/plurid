import React, {
    useState,
    useEffect,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledViewcubeModel,
    StyleViewcubeModelContainer,
    StyledViewcubeModelCube,
} from './styled';

import ViewcubeFace from '../ViewcubeFace';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface ViewcubeModelOwnProperties {
}

interface ViewcubeModelStateProperties {
    spaceRotationX: number;
    spaceRotationY: number;
}

interface ViewcubeModelDispatchProperties {
}

type ViewcubeModelProperties = ViewcubeModelOwnProperties
    & ViewcubeModelStateProperties
    & ViewcubeModelDispatchProperties;

const ViewcubeModel: React.FC<ViewcubeModelProperties> = (properties) => {
    const {
        /** own */

        /** state */
        spaceRotationX,
        spaceRotationY,

        /** dispatch */
    } = properties;

    const [hoveredZone, setHoveredZone] = useState('');

    useEffect(() => {
        console.log(hoveredZone);
    }, [
        hoveredZone,
    ]);

    return (
        <StyledViewcubeModel>
            <StyleViewcubeModelContainer>
                <StyledViewcubeModelCube
                    style={{
                        transform: `
                            translateX(32px)
                            translateY(23px)
                            rotateX(${spaceRotationX}deg)
                            rotateY(${spaceRotationY}deg)
                        `,
                        transition: 'transform 450ms ease-in-out',
                    }}
                >
                    <ViewcubeFace
                        face="front"
                        hoveredZone={hoveredZone}
                        setHoveredZone={setHoveredZone}
                    />
                    <ViewcubeFace
                        face="back"
                        hoveredZone={hoveredZone}
                        setHoveredZone={setHoveredZone}
                    />
                    <ViewcubeFace
                        face="left"
                        hoveredZone={hoveredZone}
                        setHoveredZone={setHoveredZone}
                    />
                    <ViewcubeFace
                        face="right"
                        hoveredZone={hoveredZone}
                        setHoveredZone={setHoveredZone}
                    />
                    <ViewcubeFace
                        face="top"
                        hoveredZone={hoveredZone}
                        setHoveredZone={setHoveredZone}
                    />
                    <ViewcubeFace
                        face="base"
                        hoveredZone={hoveredZone}
                        setHoveredZone={setHoveredZone}
                    />
                </StyledViewcubeModelCube>
            </StyleViewcubeModelContainer>
        </StyledViewcubeModel>
    );
}


const mapStateToProperties = (
    state: AppState,
): ViewcubeModelStateProperties => ({
    spaceRotationX: selectors.space.getRotationX(state),
    spaceRotationY: selectors.space.getRotationY(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ViewcubeModelDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(ViewcubeModel);
