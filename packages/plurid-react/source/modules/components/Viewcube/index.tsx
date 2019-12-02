import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledViewcube,
    StyledViewcubeModel,
    StyleViewcubeModelContainer,
    StyledViewcubeModelCube,
} from './styled';

import ViewcubeFace from './components/ViewcubeFace';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



interface ViewcubeOwnProperties {
}

interface ViewcubeStateProperties {
    generalTheme: Theme;
    spaceRotationX: number;
    spaceRotationY: number;
}

interface ViewcubeDispatchProperties {
}

type ViewcubeProperties = ViewcubeOwnProperties
    & ViewcubeStateProperties
    & ViewcubeDispatchProperties;

const Viewcube: React.FC<ViewcubeProperties> = (properties) => {
    const {
        /** state */
        generalTheme,
        spaceRotationX,
        spaceRotationY,
    } = properties;

    return (
        <StyledViewcube
            theme={generalTheme}
        >
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
                        />
                        <ViewcubeFace
                            face="back"
                        />
                        <ViewcubeFace
                            face="left"
                        />
                        <ViewcubeFace
                            face="right"
                        />
                        <ViewcubeFace
                            face="top"
                        />
                        <ViewcubeFace
                            face="base"
                        />
                    </StyledViewcubeModelCube>
                </StyleViewcubeModelContainer>
            </StyledViewcubeModel>
        </StyledViewcube>
    );
}


const mapStateToProperties = (
    state: AppState,
): ViewcubeStateProperties => ({
    generalTheme: selectors.themes.getGeneralTheme(state),
    spaceRotationX: selectors.space.getRotationX(state),
    spaceRotationY: selectors.space.getRotationY(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ViewcubeDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(Viewcube);
