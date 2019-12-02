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
// import actions from '../../../../services/state/actions';



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

interface ViewcubeFaceOwnProperties {
    face: string;
}

interface ViewcubeFaceStateProperties {
    generalTheme: Theme;
    interactionTheme: Theme;
}

interface ViewcubeFaceDispatchProperties {
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
    } = properties;

    const handleClick = (
        type: string
    ) => {

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
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(ViewcubeFace);
