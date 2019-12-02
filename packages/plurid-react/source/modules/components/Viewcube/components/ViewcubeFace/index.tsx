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
    frontTopLeft: { rotateX: -45, rotateY: 45 },
    frontTopCenter: { rotateX: -45, rotateY: 0 },
    frontTopRight: { rotateX: -45, rotateY: -45 },
    frontMiddleLeft: { rotateX: 0, rotateY: 45 },
    frontMiddleCenter: { rotateX: 0, rotateY: 0 },
    frontMiddleRight: { rotateX: 0, rotateY: -45 },
    frontBottomLeft: { rotateX: 45, rotateY: 45 },
    frontBottomCenter: { rotateX: 45, rotateY: 0 },
    frontBottomRight: { rotateX: 45, rotateY: -45 },

    rightTopLeft: { rotateX: -45, rotateY: -45 },
    rightTopCenter: { rotateX: -45, rotateY: 270.1 },
    rightTopRight: { rotateX: -45, rotateY: 225 },
    rightMiddleLeft: { rotateX: 0, rotateY: 315 },
    rightMiddleCenter: { rotateX: 0, rotateY: 270.1 },
    rightMiddleRight: { rotateX: 0, rotateY: 225 },
    rightBottomLeft: { rotateX: 45, rotateY: -45 },
    rightBottomCenter: { rotateX: 45, rotateY: 270.1 },
    rightBottomRight: { rotateX: 45, rotateY: 225 },

    leftTopLeft: { rotateX: -45, rotateY: 135 },
    leftTopCenter: { rotateX: -45, rotateY: 90.1 },
    leftTopRight: { rotateX: -45, rotateY: 45 },
    leftMiddleLeft: { rotateX: 0, rotateY: 135 },
    leftMiddleCenter: { rotateX: 0, rotateY: 90.1 },
    leftMiddleRight: { rotateX: 0, rotateY: 45 },
    leftBottomLeft: { rotateX: 45, rotateY: 135 },
    leftBottomCenter: { rotateX: 45, rotateY: 90.1 },
    leftBottomRight: { rotateX: 45, rotateY: 45 },

    backTopLeft: { rotateX: -45, rotateY: 225 },
    backTopCenter: { rotateX: -45, rotateY: 180.1 },
    backTopRight: { rotateX: -45, rotateY: 135 },
    backMiddleLeft: { rotateX: 0, rotateY: 225 },
    backMiddleCenter: { rotateX: 0, rotateY: 180.1 },
    backMiddleRight: { rotateX: 0, rotateY: 135 },
    backBottomLeft: { rotateX: 45, rotateY: 225 },
    backBottomCenter: { rotateX: 45, rotateY: 180.1 },
    backBottomRight: { rotateX: 45, rotateY: 135 },

    topTopLeft: { rotateX: -45, rotateY: 225 },
    topTopCenter: { rotateX: -45, rotateY: 180.1 },
    topTopRight: { rotateX: -45, rotateY: 135 },
    topMiddleLeft: { rotateX: -45, rotateY: 90.1 },
    topMiddleCenter: { rotateX: -90.1, rotateY: 0 },
    topMiddleRight: { rotateX: -45, rotateY: 270.1 },
    topBottomLeft: { rotateX: 45, rotateY: 225 },
    topBottomCenter: { rotateX: -45, rotateY: 0 },
    topBottomRight: { rotateX: -45, rotateY: -45 },


    baseTopLeft: { rotateX: -45, rotateY: 225 },
    baseTopCenter: { rotateX: -45, rotateY: 180.1 },
    baseTopRight: { rotateX: -45, rotateY: 135 },
    baseMiddleLeft: { rotateX: 0, rotateY: 225 },
    baseMiddleCenter: { rotateX: 90.1, rotateY: 0 },
    baseMiddleRight: { rotateX: 0, rotateY: 225 },
    baseBottomLeft: { rotateX: 45, rotateY: 135 },
    baseBottomCenter: { rotateX: 45, rotateY: 180.1 },
    baseBottomRight: { rotateX: 45, rotateY: 135 },
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
