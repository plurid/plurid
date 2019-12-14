import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    PluridConfiguration,
} from '@plurid/plurid-data';

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


const zoneCodes = {
    frontTopLeft: 'A1',
    frontTopCenter: 'A2',
    frontTopRight: 'A3',
    frontMiddleLeft: 'B1',
    frontMiddleCenter: 'B2',
    frontMiddleRight: 'B3',
    frontBottomLeft: 'C1',
    frontBottomCenter: 'C2',
    frontBottomRight: 'C3',

    rightTopLeft: 'A3',
    rightTopCenter: 'A4',
    rightTopRight: 'A5',
    rightMiddleLeft: 'B3',
    rightMiddleCenter: 'B4',
    rightMiddleRight: 'B5',
    rightBottomLeft: 'C3',
    rightBottomCenter: 'C4',
    rightBottomRight: 'C5',

    backTopLeft: 'A5',
    backTopCenter: 'A6',
    backTopRight: 'A7',
    backMiddleLeft: 'B5',
    backMiddleCenter: 'B6',
    backMiddleRight: 'B7',
    backBottomLeft: 'C5',
    backBottomCenter: 'C6',
    backBottomRight: 'C7',

    leftTopLeft: 'A7',
    leftTopCenter: 'A8',
    leftTopRight: 'A1',
    leftMiddleLeft: 'B7',
    leftMiddleCenter: 'B8',
    leftMiddleRight: 'B1',
    leftBottomLeft: 'C7',
    leftBottomCenter: 'C8',
    leftBottomRight: 'C1',

    topTopLeft: 'A7',
    topTopCenter: 'A6',
    topTopRight: 'A5',
    topMiddleLeft: 'A8',
    topMiddleCenter: 'D1',
    topMiddleRight: 'A4',
    topBottomLeft: 'A1',
    topBottomCenter: 'A2',
    topBottomRight: 'A3',

    baseTopLeft: 'C1',
    baseTopCenter: 'C2',
    baseTopRight: 'C3',
    baseMiddleLeft: 'C8',
    baseMiddleCenter: 'E1',
    baseMiddleRight: 'C4',
    baseBottomLeft: 'C7',
    baseBottomCenter: 'C6',
    baseBottomRight: 'C5',
};


const faceTransform = {
    A1: { rotateX: -45, rotateY: 45 },
    A2: { rotateX: -45, rotateY: 0 },
    A3: { rotateX: -45, rotateY: -45 },
    B1: { rotateX: 0, rotateY: 45 },
    B2: { rotateX: 0, rotateY: 0 },
    B3: { rotateX: 0, rotateY: -45 },
    C1: { rotateX: 45, rotateY: 45 },
    C2: { rotateX: 45, rotateY: 0 },
    C3: { rotateX: 45, rotateY: -45 },

    A4: { rotateX: -45, rotateY: 270.1 },
    A5: { rotateX: -45, rotateY: 225 },
    B4: { rotateX: 0, rotateY: 270.1 },
    B5: { rotateX: 0, rotateY: 225 },
    C4: { rotateX: 45, rotateY: 270.1 },
    C5: { rotateX: 45, rotateY: 225 },

    A6: { rotateX: -45, rotateY: 180 },
    A7: { rotateX: -45, rotateY: 135 },
    B6: { rotateX: 0, rotateY: 180.1 },
    B7: { rotateX: 0, rotateY: 135 },
    C6: { rotateX: 45, rotateY: 180.1 },
    C7: { rotateX: 45, rotateY: 135 },

    A8: { rotateX: -45, rotateY: 90.1 },
    B8: { rotateX: 0, rotateY: 90.1 },
    C8: { rotateX: 45, rotateY: 90.1 },

    D1: { rotateX: -90.1, rotateY: 0 },

    E1: { rotateX: 90.1, rotateY: 0 },
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
    mouseOver: boolean;
    hoveredZone: string;
    setHoveredZone: React.Dispatch<React.SetStateAction<string>>;
    activeZone: string;
    setActiveZone: React.Dispatch<React.SetStateAction<string>>;
}

interface ViewcubeFaceStateProperties {
    generalTheme: Theme;
    interactionTheme: Theme;
    configuration: PluridConfiguration;
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
        mouseOver,
        hoveredZone,
        setHoveredZone,
        activeZone,
        setActiveZone,

        /** state */
        generalTheme,
        interactionTheme,
        configuration,

        /** dispatch */
        dispatchRotateX,
        dispatchRotateY,
        dispatchSetAnimatedTransform,
    } = properties;

    const opaqueFace = configuration.elements.viewcube.opaque;

    const handleClick = (
        type: string,
    ) => {
        const faceType = `${face}${type}`;
        const zoneCode = zoneCodes[faceType];
        const transform = faceTransform[zoneCode];
        // console.log(zoneCode);
        // console.log(transform);
        setActiveZone(zoneCode);

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
            opaque={opaqueFace}
            mouseOver={mouseOver}
        >
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.topLeft}
                active={activeZone === zoneCodes[`${face}${faceTypes.topLeft}`]}
                hovered={hoveredZone === zoneCodes[`${face}${faceTypes.topLeft}`]}
                onClick={() => handleClick(faceTypes.topLeft)}
                onMouseEnter={() => setHoveredZone(zoneCodes[`${face}${faceTypes.topLeft}`])}
            />
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.topCenter}
                active={activeZone === zoneCodes[`${face}${faceTypes.topCenter}`]}
                hovered={hoveredZone === zoneCodes[`${face}${faceTypes.topCenter}`]}
                onClick={() => handleClick(faceTypes.topCenter)}
                onMouseEnter={() => setHoveredZone(zoneCodes[`${face}${faceTypes.topCenter}`])}
            />
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.topRight}
                active={activeZone === zoneCodes[`${face}${faceTypes.topRight}`]}
                hovered={hoveredZone === zoneCodes[`${face}${faceTypes.topRight}`]}
                onClick={() => handleClick(faceTypes.topRight)}
                onMouseEnter={() => setHoveredZone(zoneCodes[`${face}${faceTypes.topRight}`])}
            />


            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.middleLeft}
                active={activeZone === zoneCodes[`${face}${faceTypes.middleLeft}`]}
                hovered={hoveredZone === zoneCodes[`${face}${faceTypes.middleLeft}`]}
                onClick={() => handleClick(faceTypes.middleLeft)}
                onMouseEnter={() => setHoveredZone(zoneCodes[`${face}${faceTypes.middleLeft}`])}
            />
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.middleCenter}
                active={activeZone === zoneCodes[`${face}${faceTypes.middleCenter}`]}
                hovered={hoveredZone === zoneCodes[`${face}${faceTypes.middleCenter}`]}
                onClick={() => handleClick(faceTypes.middleCenter)}
                onMouseEnter={() => setHoveredZone(zoneCodes[`${face}${faceTypes.middleCenter}`])}
            >
                {face}
            </StyledViewcubeFaceZone>
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.middleRight}
                active={activeZone === zoneCodes[`${face}${faceTypes.middleRight}`]}
                hovered={hoveredZone === zoneCodes[`${face}${faceTypes.middleRight}`]}
                onClick={() => handleClick(faceTypes.middleRight)}
                onMouseEnter={() => setHoveredZone(zoneCodes[`${face}${faceTypes.middleRight}`])}
            />


            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.bottomLeft}
                active={activeZone === zoneCodes[`${face}${faceTypes.bottomLeft}`]}
                hovered={hoveredZone === zoneCodes[`${face}${faceTypes.bottomLeft}`]}
                onClick={() => handleClick(faceTypes.bottomLeft)}
                onMouseEnter={() => setHoveredZone(zoneCodes[`${face}${faceTypes.bottomLeft}`])}
            />
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.bottomCenter}
                active={activeZone === zoneCodes[`${face}${faceTypes.bottomCenter}`]}
                hovered={hoveredZone === zoneCodes[`${face}${faceTypes.bottomCenter}`]}
                onClick={() => handleClick(faceTypes.bottomCenter)}
                onMouseEnter={() => setHoveredZone(zoneCodes[`${face}${faceTypes.bottomCenter}`])}
            />
            <StyledViewcubeFaceZone
                theme={interactionTheme}
                type={faceTypes.bottomRight}
                active={activeZone === zoneCodes[`${face}${faceTypes.bottomRight}`]}
                hovered={hoveredZone === zoneCodes[`${face}${faceTypes.bottomRight}`]}
                onClick={() => handleClick(faceTypes.bottomRight)}
                onMouseEnter={() => setHoveredZone(zoneCodes[`${face}${faceTypes.bottomRight}`])}
            />
        </StyledViewcubeFace>
    );
};


const mapStateToProperties = (
    state: AppState,
): ViewcubeFaceStateProperties => ({
    generalTheme: selectors.themes.getGeneralTheme(state),
    interactionTheme: selectors.themes.getInteractionTheme(state),
    configuration: selectors.configuration.getConfiguration(state),
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
