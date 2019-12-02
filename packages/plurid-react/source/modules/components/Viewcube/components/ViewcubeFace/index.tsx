import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledViewcubeFace,
    StyledViewcubeFaceZone,
} from './styled';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
import actions from '../../../../services/state/actions';



const faceTypes = {
    topLeft: 'TopLeft',
    topCenter: 'TopCenter',
    topRight: 'TopRight',

    middleLeft: 'MiddleLeft',
    middleCenter: 'MiddleCenter',
    middleRight: 'MiddleRight',

    bottomLeft: 'BottomLeft',
    bottomCenter: 'BottomCenter',
    bottomRight: 'BottomRight',
};

const zoneClickTransforms = {
    frontMiddleCenter: { rotateX: 0, rotateY: 0 },
    frontTopLeft: { rotateX: -45, rotateY: 45 },
    frontTopCenter: { rotateX: -45, rotateY: 0 },
    rightTopLeft: { rotateX: -45, rotateY: -45 },
    frontMiddleLeft: { rotateX: 0, rotateY: 45 },
    rightMiddleLeft: { rotateX: 0, rotateY: 315 },
    frontBottomLeft: { rotateX: 45, rotateY: 45 },
    frontBottomCenter: { rotateX: 45, rotateY: 0 },
    rightBottomLeft: { rotateX: 45, rotateY: -45 },
    leftMiddleCenter: { rotateX: 0, rotateY: 90.1 },
    leftTopLeft: { rotateX: -45, rotateY: 135 },
    leftTopCenter: { rotateX: -45, rotateY: 90.1 },
    leftMiddleLeft: { rotateX: 0, rotateY: 135 },
    leftBottomLeft: { rotateX: 45, rotateY: 135 },
    leftBottomCenter: { rotateX: 45, rotateY: 90.1 },
    backMiddleCenter: { rotateX: 0, rotateY: 180.1 },
    backTopLeft: { rotateX: -45, rotateY: 225 },
    backTopCenter: { rotateX: -45, rotateY: 180.1 },
    backMiddleLeft: { rotateX: 0, rotateY: 225 },
    backBottomLeft: { rotateX: 45, rotateY: 225 },
    backBottomCenter: { rotateX: 45, rotateY: 180.1 },
    rightMiddleCenter: { rotateX: 0, rotateY: 270.1 },
    rightTopCenter: { rotateX: -45, rotateY: 270.1 },
    rightBottomCenter: { rotateX: 45, rotateY: 270.1 },
    topMiddleCenter: { rotateX: -90.1, rotateY: 0 },
    baseMiddleCenter: { rotateX: 90.1, rotateY: 0 },
};


interface ViewcubeFaceOwnProperties {
    face: string;
}

interface ViewcubeFaceStateProperties {
    generalTheme: Theme;
    interactionTheme: Theme;
}

interface ViewcubeFaceDispatchProperties {
    dispatchRotateX: typeof actions.space.rotateX;
    dispatchRotateY: typeof actions.space.rotateY;
    dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform;
}

type ViewcubeFaceProperties = ViewcubeFaceOwnProperties
    & ViewcubeFaceStateProperties
    & ViewcubeFaceDispatchProperties;

const ViewcubeFace: React.FC<ViewcubeFaceProperties> = (properties) => {
    const {
        /** own */
        face,

        /** state */
        generalTheme,
        interactionTheme,

        /** dispatch */
        dispatchRotateX,
        dispatchRotateY,
        dispatchSetAnimatedTransform,
    } = properties;

    const handleClick = (
        type: string,
    ) => {
        const transform = zoneClickTransforms[`${face}${type}`];
        console.log(transform);

        dispatchSetAnimatedTransform(true);
        dispatchRotateX(transform.rotateX);
        dispatchRotateY(transform.rotateY);
        setTimeout(() => {
            dispatchSetAnimatedTransform(false);
        }, 450);
    }

    return (
        <StyledViewcubeFace
            theme={generalTheme}
            face={face}
        >
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.topLeft}
                onClick={() => handleClick(faceTypes.topLeft)}
            />
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.topCenter}
                onClick={() => handleClick(faceTypes.topCenter)}
            />
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.topRight}
                onClick={() => handleClick(faceTypes.topRight)}
            />


            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.middleLeft}
                onClick={() => handleClick(faceTypes.middleLeft)}
            />
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.middleCenter}
                onClick={() => handleClick(faceTypes.middleCenter)}
            >
                {face}
            </StyledViewcubeFaceZone>
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.middleRight}
                onClick={() => handleClick(faceTypes.middleRight)}
            />


            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.bottomLeft}
                onClick={() => handleClick(faceTypes.bottomLeft)}
            />
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.bottomCenter}
                onClick={() => handleClick(faceTypes.bottomCenter)}
            />
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.bottomRight}
                onClick={() => handleClick(faceTypes.bottomRight)}
            />
        </StyledViewcubeFace>
    );
}


const mapStateToProperties = (
    state: AppState,
): ViewcubeFaceStateProperties => ({
    generalTheme: selectors.themes.getGeneralTheme(state),
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ViewcubeFaceDispatchProperties => ({
    dispatchRotateX: (angleX: number) => dispatch(
        actions.space.rotateX(angleX),
    ),
    dispatchRotateY: (angleY: number) => dispatch(
        actions.space.rotateY(angleY),
    ),
    dispatchSetAnimatedTransform: (animated: boolean) => dispatch(
        actions.space.setAnimatedTransform(animated)
    ),
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(ViewcubeFace);
