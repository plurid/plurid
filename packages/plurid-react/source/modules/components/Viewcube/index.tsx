import React, {
    useState,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledViewcube,
    StyledViewcubeArrow,
    StyledViewcubeArrowIcon,
} from './styled';

import ViewcubeModel from './components/ViewcubeModel';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';



interface ViewcubeOwnProperties {
}

interface ViewcubeStateProperties {
    interactionTheme: Theme;
}

interface ViewcubeDispatchProperties {
    rotateXWith: typeof actions.space.rotateXWith;
    rotateYWith: typeof actions.space.rotateYWith;
}

type ViewcubeProperties = ViewcubeOwnProperties
    & ViewcubeStateProperties
    & ViewcubeDispatchProperties;

const Viewcube: React.FC<ViewcubeProperties> = (properties) => {
    const {
        /** state */
        interactionTheme,

        /** dispatch */
        rotateXWith,
        rotateYWith
    } = properties;

    const [mouseOver, setMouseOver] = useState(false);

    return (
        <StyledViewcube
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onMouseMove={() => !mouseOver ? setMouseOver(true) : null}
        >
            <ViewcubeModel />

            {mouseOver && (
                <>
                    <StyledViewcubeArrow
                        style={{
                            gridArea: 'pluridViewcubeRotateUp',
                        }}
                    >
                        <StyledViewcubeArrowIcon
                            theme={interactionTheme}
                            onClick={() => rotateXWith(90)}
                        >
                            ▲
                        </StyledViewcubeArrowIcon>
                    </StyledViewcubeArrow>

                    <StyledViewcubeArrow
                        theme={interactionTheme}
                        style={{
                            gridArea: 'pluridViewcubeRotateDown',
                        }}
                    >
                        <StyledViewcubeArrowIcon
                            theme={interactionTheme}
                            onClick={() => rotateXWith(-90)}
                        >
                            ▼
                        </StyledViewcubeArrowIcon>
                    </StyledViewcubeArrow>

                    <StyledViewcubeArrow
                        theme={interactionTheme}
                        style={{
                            gridArea: 'pluridViewcubeRotateLeft',
                        }}
                    >
                        <StyledViewcubeArrowIcon
                            theme={interactionTheme}
                            onClick={() => rotateYWith(90)}
                        >
                            ◀
                        </StyledViewcubeArrowIcon>
                    </StyledViewcubeArrow>

                    <StyledViewcubeArrow
                        theme={interactionTheme}
                        style={{
                            gridArea: 'pluridViewcubeRotateRight',
                        }}
                    >
                        <StyledViewcubeArrowIcon
                            theme={interactionTheme}
                            onClick={() => rotateYWith(-90)}
                        >
                            ▶
                        </StyledViewcubeArrowIcon>
                    </StyledViewcubeArrow>
                </>
            )}
        </StyledViewcube>
    );
}


const mapStateToProperties = (
    state: AppState,
): ViewcubeStateProperties => ({
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ViewcubeDispatchProperties => ({
    rotateXWith: (value: number) => dispatch(
        actions.space.rotateXWith(value)
    ),
    rotateYWith: (value: number) => dispatch(
        actions.space.rotateYWith(value)
    ),
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(Viewcube);
