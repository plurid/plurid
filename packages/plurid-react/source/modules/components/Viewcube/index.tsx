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
    dispatchRotateXWith: typeof actions.space.rotateXWith;
    dispatchRotateYWith: typeof actions.space.rotateYWith;
    dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform;
}

type ViewcubeProperties = ViewcubeOwnProperties
    & ViewcubeStateProperties
    & ViewcubeDispatchProperties;

const Viewcube: React.FC<ViewcubeProperties> = (properties) => {
    const {
        /** state */
        interactionTheme,

        /** dispatch */
        dispatchRotateXWith,
        dispatchRotateYWith,
        dispatchSetAnimatedTransform,
    } = properties;

    const [mouseOver, setMouseOver] = useState(false);

    const animatedRotate = (
        type: string,
        value: number,
    ) => {
        dispatchSetAnimatedTransform(true);
        switch (type) {
            case 'rotateX':
                dispatchRotateXWith(value);
                break;
            case 'rotateY':
                dispatchRotateYWith(value);
                break;
        }
        setTimeout(() => {
            dispatchSetAnimatedTransform(false);
        }, 450);
    }

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
                            onClick={() => animatedRotate('rotateX', 90.1)}
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
                            onClick={() => animatedRotate('rotateX', -90.1)}
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
                            onClick={() => animatedRotate('rotateY', 90.1)}
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
                            onClick={() => animatedRotate('rotateY', -90.1)}
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
    dispatchRotateXWith: (value: number) => dispatch(
        actions.space.rotateXWith(value)
    ),
    dispatchRotateYWith: (value: number) => dispatch(
        actions.space.rotateYWith(value)
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
)(Viewcube);
