import React, {
    useState,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledToolbar,
    StyledToolbarButtons,
    StyledToolbarRotate,
    StyledToolbarTranslate,
    StyledToolbarScale,
    StyledToolbarTransformButton,
    StyledToolbarTransformText,
} from './styled';

// import ToolbarButton from '../Button';

import { Theme } from '@plurid/plurid-themes';

import { AppState } from '../../../services/state/store';
import StateContext from '../../../services/state/context';
import selectors from '../../../services/state/selectors';
import actions from '../../../services/state/actions';



interface ToolbarOwnProperties {
}

interface ToolbarStateProperties {
    theme: Theme;
}

interface ToolbarDispatchProperties {
    rotateUp: typeof actions.space.rotateUp;
    rotateDown: typeof actions.space.rotateDown;
    rotateLeft: typeof actions.space.rotateLeft;
    rotateRight: typeof actions.space.rotateRight;

    scaleUp: typeof actions.space.scaleUp;
    scaleDown: typeof actions.space.scaleDown;

    translateUp: typeof actions.space.translateUp;
    translateDown: typeof actions.space.translateDown;
    translateLeft: typeof actions.space.translateLeft;
    translateRight: typeof actions.space.translateRight;
}

type ToolbarProperties = ToolbarOwnProperties
    & ToolbarStateProperties
    & ToolbarDispatchProperties;

const Toolbar: React.FC<ToolbarProperties> = (properties) => {
    const [mouseIn, setMouseIn] = useState(false);

    const {
        theme,

        rotateUp,
        rotateDown,
        rotateLeft,
        rotateRight,

        scaleUp,
        scaleDown,

        translateUp,
        translateDown,
        translateLeft,
        translateRight,
    } = properties;

    return (
        <StyledToolbar
            onMouseEnter={() => setMouseIn(true)}
            onMouseLeave={() => setMouseIn(false)}
        >
            <StyledToolbarButtons
                theme={theme}
            >
                <StyledToolbarRotate>
                    <StyledToolbarTransformButton
                        theme={theme}
                        onClick={rotateRight}
                    >
                        ◀
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformButton
                        theme={theme}
                        onClick={rotateUp}
                    >
                        ▲
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformText>
                        rotate
                    </StyledToolbarTransformText>

                    <StyledToolbarTransformButton
                        theme={theme}
                        onClick={rotateDown}
                    >
                        ▼
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformButton
                        theme={theme}
                        onClick={rotateLeft}
                    >
                        ▶
                    </StyledToolbarTransformButton>
                </StyledToolbarRotate>

                <StyledToolbarScale>
                    <StyledToolbarTransformButton
                        theme={theme}
                        onClick={scaleUp}
                    >
                        ▲
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformText>
                        scale
                    </StyledToolbarTransformText>

                    <StyledToolbarTransformButton
                        theme={theme}
                        onClick={scaleDown}
                    >
                        ▼
                    </StyledToolbarTransformButton>
                </StyledToolbarScale>

                <StyledToolbarTranslate>
                    <StyledToolbarTransformButton
                        theme={theme}
                        onClick={translateLeft}
                    >
                        ◀
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformButton
                        theme={theme}
                        onClick={translateUp}
                    >
                        ▲
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformText>
                        translate
                    </StyledToolbarTransformText>

                    <StyledToolbarTransformButton
                        theme={theme}
                        onClick={translateDown}
                    >
                        ▼
                    </StyledToolbarTransformButton>

                    <StyledToolbarTransformButton
                        theme={theme}
                        onClick={translateRight}
                    >
                        ▶
                    </StyledToolbarTransformButton>
                </StyledToolbarTranslate>
            </StyledToolbarButtons>
        </StyledToolbar>
    );
}


const mapStateToProps = (state: AppState): ToolbarStateProperties => ({
    theme: selectors.themes.getGeneralTheme(state),
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): ToolbarDispatchProperties => ({
    rotateUp: () => dispatch(actions.space.rotateUp()),
    rotateDown: () => dispatch(actions.space.rotateDown()),
    rotateLeft: () => dispatch(actions.space.rotateLeft()),
    rotateRight: () => dispatch(actions.space.rotateRight()),

    scaleUp: () => dispatch(actions.space.scaleUp()),
    scaleDown: () => dispatch(actions.space.scaleDown()),

    translateUp: () => dispatch(actions.space.translateUp()),
    translateDown: () => dispatch(actions.space.translateDown()),
    translateLeft: () => dispatch(actions.space.translateLeft()),
    translateRight: () => dispatch(actions.space.translateRight()),
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(Toolbar);
