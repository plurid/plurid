import React, {
    useState,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    Theme,
} from '@plurid/plurid-themes';

import {
    StyledViewcube,
    StyledViewcubeArrow,
    StyledViewcubeArrowIcon,
    StyledFitView,
} from './styled';

import ViewcubeModel from './components/ViewcubeModel';

import GlobalIcon from '../../assets/icons/global-icon';

import { AppState } from '../../services/state/store';
import StateContext from '../../services/state/context';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';



interface ViewcubeOwnProperties {
}

interface ViewcubeStateProperties {
    configuration: PluridConfiguration;
    interactionTheme: Theme;
}

interface ViewcubeDispatchProperties {
    dispatchRotateXWith: typeof actions.space.rotateXWith;
    dispatchRotateYWith: typeof actions.space.rotateYWith;
    dispatchSetAnimatedTransform: typeof actions.space.setAnimatedTransform;
    dispatchSpaceResetTransform: typeof actions.space.spaceResetTransform;
}

type ViewcubeProperties = ViewcubeOwnProperties
    & ViewcubeStateProperties
    & ViewcubeDispatchProperties;

const Viewcube: React.FC<ViewcubeProperties> = (properties) => {
    const {
        /** state */
        configuration,
        interactionTheme,

        /** dispatch */
        dispatchRotateXWith,
        dispatchRotateYWith,
        dispatchSetAnimatedTransform,
        dispatchSpaceResetTransform,
    } = properties;

    const {
        viewcube,
    } = configuration.elements;
    const opaqueViewcube = viewcube.opaque;

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

    const animatedReset = () => {
        dispatchSetAnimatedTransform(true);
        dispatchSpaceResetTransform();
        setTimeout(() => {
            dispatchSetAnimatedTransform(false);
        }, 450);
    }

    return (
        <StyledViewcube
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
            onMouseMove={() => !mouseOver ? setMouseOver(true) : null}
            transparent={!opaqueViewcube}
        >
            <ViewcubeModel
                mouseOver={mouseOver}
            />

            {mouseOver && (
                <>
                    <StyledViewcubeArrow
                        style={{
                            gridArea: 'pluridViewcubeRotateUp',
                        }}
                    >
                        <StyledViewcubeArrowIcon
                            theme={interactionTheme}
                            onClick={() => animatedRotate('rotateX', -90.1)}
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
                            onClick={() => animatedRotate('rotateX', 90.1)}
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

                    <StyledFitView
                        onClick={() => animatedReset()}
                    >
                        {GlobalIcon}
                    </StyledFitView>
                </>
            )}
        </StyledViewcube>
    );
}


const mapStateToProperties = (
    state: AppState,
): ViewcubeStateProperties => ({
    configuration: selectors.configuration.getConfiguration(state),
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
    dispatchSpaceResetTransform: () => dispatch(
        actions.space.spaceResetTransform()
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
